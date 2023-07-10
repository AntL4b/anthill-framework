import { AHHttpRequestCache } from "../../core/cache/http-request-cache";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHCacheConfig } from "../models/cache-config";
import { AHHttpResponseBodyStatusEnum } from "../models/enums/http-response-body-status-enum";
import { AHRestMethodEnum } from "../models/enums/rest-method-enum";
import { AHHttpResponse } from "../models/http/http-response";
import { AHLogger } from "./logger";
import { AHAbstractMiddleware } from "./middlewares/abstract-middleware";
import { AHRestHandlerParams } from "../models/rest-handler/rest-handler-params";
import { AHCallable } from "../models/rest-handler/callable";
import { AHException } from "./anthill-exception";
import { AHRestHandlerOptions } from "../models/rest-handler/rest-handler-options";
import { AHTimeTracker } from "./time-tracker";


export class AHRestHandler {

  private static defaultCacheConfig: AHCacheConfig = {
    cachable: false,
    ttl: 120,
    maxCacheSize: 1000000,
  };

  private static defaultOptions: AHRestHandlerOptions = {
    displayPerformanceMetrics: false,
  };

  private name: string;
  private method: AHRestMethodEnum;
  private middlewares: Array<AHAbstractMiddleware<any>> = [];
  private callable: AHCallable;
  private cacheConfig: AHCacheConfig = AHRestHandler.defaultCacheConfig;
  private options: AHRestHandlerOptions = AHRestHandler.defaultOptions;

  constructor(params: AHRestHandlerParams) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(`Invalid handler name: ${params.name}. Handler name must respect typescript var naming convention`);
    }

    this.name = params.name;
    this.method = params.method;
    this.callable = params.callable;

    if (params.middlewares) {
      this.middlewares = params.middlewares;
    }

    if (params.cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...params.cacheConfig };
    }

    if (params.cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...params.cacheConfig };
    }
  }

  /**
   * Set the default cache config
   * @param cacheConfig The cache config (override) to set by default
   */
  static setDefaultCacheConfig(cacheConfig: AHCacheConfig): void {
    AHRestHandler.defaultCacheConfig = {
      ...AHRestHandler.defaultCacheConfig,
      ...cacheConfig
    }
  }

  /**
   * Set the default optionsc
   * @param options The options (override) to set by default
   */
    static setDefaultOptions(options: AHRestHandlerOptions): void {
      AHRestHandler.defaultOptions = {
        ...AHRestHandler.defaultOptions,
        ...options
      }
    }

  /**
   * Get rest handler name
   * @returns The rest handler name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Set a new cache config for the handler
   * @param cacheConfig The cache config to be set
   */
  setCacheConfig(cacheConfig: AHCacheConfig): void {
    this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
  }

  /**
   * Set new options for the handler
   * @param options The options to be set
   */
  setOptions(options: AHRestHandlerOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Add a middleware to the middleware pipeline execution
   * @param middleware 
   */
  addMiddleware(middleware: AHAbstractMiddleware<any>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Handle the request
   * Run all the middlewares one by one before running the handler callable function
   * @param event The event to be passed through middlewares and callable function
   * @returns An http response
   */
  async handleRequest(event: AHAwsEvent): Promise<AHHttpResponse> {
    const tracker: AHTimeTracker = new AHTimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      // Make event an instance of AHAwsEvent
      let ev: AHAwsEvent = new AHAwsEvent();
      Object.assign(ev, event);

      AHLogger.getInstance().debug("Handling request");
      AHLogger.getInstance().debug(`Method: ${this.method}`);
      AHLogger.getInstance().debug(`Name: ${this.name}`);

      if (this.cacheConfig.cachable) {
        tracker.startSegment("cache-configuration");
        AHHttpRequestCache.getInstance().setConfig(this.cacheConfig);
        AHHttpRequestCache.getInstance().flushCache(this.cacheConfig.ttl);
        tracker.stopSegment("cache-configuration");
      }

      // Init middleware data with an empty object
      ev.middlewareData = {};

      // Run all the middlewares one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        tracker.startSegment(`middleware-${i}`);
        AHLogger.getInstance().debug(`Running middleware ${i + 1} of ${this.middlewares.length}`);
        const middleware: AHAbstractMiddleware<any> = this.middlewares[i];

        const middlewareResult = await middleware.run(ev);

        // The middleware returned an AHAwsEvent
        if (middlewareResult instanceof AHAwsEvent) {
          ev = middlewareResult;
        } else {
          // The middleware returned an HttpResponse
          AHLogger.getInstance().debug("Middleware returned an HTTP response");

          // Stop tracker
          tracker.stopSegment(`middleware-${i}`);
          tracker.stopTrackingSession();
          this.displayPerformanceMetrics(tracker);

          // End the request handle with this response
          return middlewareResult;
        }
        tracker.stopSegment(`middleware-${i}`);
      }

      if (this.cacheConfig.cachable) {
        tracker.startSegment("cache-retrieving");

        AHLogger.getInstance().debug("Try to get last http response from cache");
        const cacheResponse = AHHttpRequestCache.getInstance().getCacheItem(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
        );

        if (cacheResponse) {
          AHLogger.getInstance().debug("Last http response successfully retrieved from cache");

          // Stop tracker
          tracker.stopSegment("cache-retrieving");
          tracker.stopTrackingSession();
          this.displayPerformanceMetrics(tracker);

          return cacheResponse;
        }
        tracker.stopSegment("cache-retrieving");
      }

      // Now run the handler callable function
      AHLogger.getInstance().debug("Running handler callable");

      tracker.startSegment("callable-run");
      const callableReponse = await this.callable(ev);
      tracker.stopSegment("callable-run");

      if (this.cacheConfig.cachable) {
        AHHttpRequestCache.getInstance().addDataInCache(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
          callableReponse,
        );
      }

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);
      return callableReponse;
    } catch (e) {
      AHLogger.getInstance().error((e as { message: string }).message);

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);

      return AHHttpResponse.error({
        status: AHHttpResponseBodyStatusEnum.Error,
        message: (e as { message: string }).message,
      });
    }
  }

  /**
   * Display performance metrics for given tracker
   * @param tracker Tracker to print metrics for
   */
  displayPerformanceMetrics(tracker: AHTimeTracker) {
    if (this.options.displayPerformanceMetrics) {
      tracker.logTrackingSession();
    }
  }
}
