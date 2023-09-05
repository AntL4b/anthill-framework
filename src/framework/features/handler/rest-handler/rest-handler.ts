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

      // Set default response
      let response: AHHttpResponse = null;

      // Init middleware data with an empty object
      ev.middlewareData = {};

      tracker.startSegment(`middleware-runBefore`);

      // Run all the middlewares runBefore one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runBefore for middleware ${i + 1} of ${this.middlewares.length}`);

        const middlewareResult = await this.middlewares[i].runBefore(ev, context);

        // The middleware returned an AHAwsEvent
        if (middlewareResult instanceof AHAwsEvent) {
          ev = middlewareResult;
        } else {
          // The middleware returned an HttpResponse
          AHLogger.getInstance().debug("Middleware returned an HTTP response");

          // Save the middleware result inside the response and end the middleware loop
          response = middlewareResult;
          break;
        }
      }

      tracker.stopSegment(`middleware-runBefore`);

      // Try to retrieve any eventual cached response if cachable option is set
      if (response === null && this.cacheConfig.cachable) {
        tracker.startSegment("cache-retrieving");

        AHLogger.getInstance().debug("Try to get last http response from cache");
        response = this.httpCache.getCacheItem(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
        );

        if (response !== null) {
          AHLogger.getInstance().debug("Last http response successfully retrieved from cache");
        }

        tracker.stopSegment("cache-retrieving");
      }

      if (response === null) {
        // Now run the handler callable function
        AHLogger.getInstance().debug("Running handler callable");

        tracker.startSegment("callable-run");

        try {
          response = await this.callable(ev, context);
        } catch (e) {
          AHLogger.getInstance().error((e as { message: string }).message);
          response = AHHttpResponse.error({
            status: AHHttpResponseBodyStatusEnum.Error,
            message: (e as { message: string }).message,
          });
        }

        tracker.stopSegment("callable-run");

        if (this.cacheConfig.cachable) {
          this.httpCache.addDataInCache(
            AHHttpRequestCache.buildCacheRequestParameters(ev),
            response,
          );
        }
      }

      tracker.startSegment(`middleware-runAfter`);

      // Run all the middlewares runAfter one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runAfter for middleware ${i + 1} of ${this.middlewares.length}`);
        response = await this.middlewares[i].runAfter(response, ev, context);
      }

      tracker.stopSegment(`middleware-runAfter`);
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
