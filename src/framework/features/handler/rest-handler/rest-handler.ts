import { AHHttpRequestCache } from "../../../../core/cache/http-request-cache";
import { AHAwsEvent } from "../../../models/aws/event/aws-event";
import { AHCacheConfig } from "../../../models/cache-config";
import { AHHttpResponseBodyStatusEnum } from "../../../models/enums/http-response-body-status-enum";
import { AHRestMethodEnum } from "../../../models/enums/rest-method-enum";
import { AHHttpResponse } from "../../http-response";
import { AHLogger } from "../../logger";
import { AHMiddleware } from "./middlewares/middleware";
import { AHRestHandlerParams } from "../../../models/handler/rest-handler-params";
import { AHTimeTracker } from "../../time-tracker";
import { AHAbstractHandler } from "../../../../core/abstract-handler";
import { AHAwsContext } from "../../../models/aws/aws-context";


export class AHRestHandler extends AHAbstractHandler<AHAwsEvent, AHHttpResponse> {

  private static defaultCacheConfig: AHCacheConfig = {
    cachable: false,
    ttl: 120,
    maxCacheSize: 1000000,
  };

  private method: AHRestMethodEnum;
  private middlewares: Array<AHMiddleware<any>> = [];
  private cacheConfig: AHCacheConfig = AHRestHandler.defaultCacheConfig;
  private httpCache: AHHttpRequestCache = new AHHttpRequestCache();

  constructor(params: AHRestHandlerParams) {
    super(params);

    this.method = params.method;

    if (params.middlewares) { this.middlewares = params.middlewares; }
    if (params.cacheConfig) { this.cacheConfig = { ...this.cacheConfig, ...params.cacheConfig }; }
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
   * Set a new cache config for the handler
   * @param cacheConfig The cache config to be set
   */
  setCacheConfig(cacheConfig: AHCacheConfig): void {
    this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
  }

  /**
   * Add a middleware to the middleware pipeline execution
   * @param middleware 
   */
  addMiddleware(middleware: AHMiddleware<any>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Handle the request
   * Run all the middlewares one by one before running the handler callable function
   * @param event The event to be passed through middlewares and callable function
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @returns An http response
   */
  async handleRequest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
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
        this.httpCache.setConfig(this.cacheConfig);
        this.httpCache.flushCache(this.cacheConfig.ttl);
        tracker.stopSegment("cache-configuration");
      }

      // Init middleware data with an empty object
      ev.middlewareData = {};

      // Run all the middlewares runBefore one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        tracker.startSegment(`middleware-runBefore-${i}`);
        AHLogger.getInstance().debug(`Running runBefore for middleware ${i + 1} of ${this.middlewares.length}`);

        const middlewareResult = await this.middlewares[i].runBefore(ev, context);

        // The middleware returned an AHAwsEvent
        if (middlewareResult instanceof AHAwsEvent) {
          ev = middlewareResult;
        } else {
          // The middleware returned an HttpResponse
          AHLogger.getInstance().debug("Middleware returned an HTTP response");

          // Stop tracker
          tracker.stopSegment(`middleware-runBefore-${i}`);
          tracker.stopTrackingSession();
          this.displayPerformanceMetrics(tracker);

          // End the request handle with this response
          return middlewareResult;
        }
        tracker.stopSegment(`middleware-runBefore-${i}`);
      }

      let response: AHHttpResponse = null;

      if (this.cacheConfig.cachable) {
        tracker.startSegment("cache-retrieving");

        AHLogger.getInstance().debug("Try to get last http response from cache");
        response = this.httpCache.getCacheItem(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
        );

        if (response) {
          AHLogger.getInstance().debug("Last http response successfully retrieved from cache");
        }

        tracker.stopSegment("cache-retrieving");
      }

      if (!response) {
        // Now run the handler callable function
        AHLogger.getInstance().debug("Running handler callable");

        tracker.startSegment("callable-run");
        response = await this.callable(ev, context);
        tracker.stopSegment("callable-run");

        if (this.cacheConfig.cachable) {
          this.httpCache.addDataInCache(
            AHHttpRequestCache.buildCacheRequestParameters(ev),
            response,
          );
        }
      }

      // Run all the middlewares runAfter one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        tracker.startSegment(`middleware-runAfter-${i}`);
        AHLogger.getInstance().debug(`Running runAfter for middleware ${i + 1} of ${this.middlewares.length}`);

        response = await this.middlewares[i].runAfter(response, ev, context);

        tracker.stopSegment(`middleware-runAfter-${i}`);
      }
      

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);
      return response;
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
}
