import { AHHttpRequestCache } from "../../../core/cache/http-request-cache";
import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponseBodyStatusEnum } from "../../models/enums/http-response-body-status-enum";
import { AHRestMethodEnum } from "../../models/enums/rest-method-enum";
import { AHHttpResponse } from "../http-response";
import { AHLogger } from "../logger";
import { AHMiddleware } from "../middleware/middleware";
import { AHRestHandlerConfig } from "../../models/handler/rest-handler-config";
import { AHTimeTracker } from "../time-tracker";
import { AHAbstractHandler } from "../../../core/abstract-handler";
import { AHAwsContext } from "../../models/aws/aws-context";
import { Anthill } from "../anthill";
import { AHRestHandlerCacheConfig } from "../../models/rest-handler-cache-config";


export class AHRestHandler extends AHAbstractHandler<AHAwsEvent, AHHttpResponse> {
  private cacheConfig: AHRestHandlerCacheConfig = Anthill.getInstance()._configuration.restHandlerConfig.cacheConfig;
  private httpCache: AHHttpRequestCache = new AHHttpRequestCache();
  private method: AHRestMethodEnum;
  private middlewares: Array<AHMiddleware<any>> = [];

  constructor(params: AHRestHandlerConfig) {
    // Apply restHandlerConfig options
    params.options = { ...Anthill.getInstance()._configuration.restHandlerConfig.options, ...params.options };
    super(params);

    this.method = params.method;

    if (params.middlewares) { this.middlewares = params.middlewares; }
    if (params.cacheConfig) { this.cacheConfig = { ...this.cacheConfig, ...params.cacheConfig }; }
  }

  /**
   * Set a new cache config for the handler
   * @param cacheConfig The cache config to be set
   */
  setCacheConfig(cacheConfig: AHRestHandlerCacheConfig): void {
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
   * @param callback Callback method to respond the lambda call (pref not to use it)
   * @returns An http response
   */
  async handleRequest(event: AHAwsEvent, context?: AHAwsContext, callback?: (...args: Array<any>) => any): Promise<AHHttpResponse> {
    const tracker: AHTimeTracker = new AHTimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      const controllerName = await this.controllerName;
      const controllerInstance = Anthill.getInstance()._dependencyContainer.resolve(controllerName);

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

      // Add anthill configuration middlewares to middleware list
      const middlewares = [...Anthill.getInstance()._configuration.restHandlerConfig.middlewares, ...this.middlewares];

      // Run all the middlewares runBefore one by one
      for (let i = 0; i < middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runBefore for middleware ${i + 1} of ${middlewares.length}`);

        const middlewareResult = await middlewares[i].runBefore(ev, context);

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
          AHHttpRequestCache.buildCacheRequestParameters(ev, this.cacheConfig.headersToInclude),
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
          response = await this.callable.call(controllerInstance, ...[ev, context, callback]);
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
            AHHttpRequestCache.buildCacheRequestParameters(ev, this.cacheConfig.headersToInclude),
            response,
          );
        }
      }

      tracker.startSegment(`middleware-runAfter`);

      // Run all the middlewares runAfter one by one
      for (let i = 0; i < middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runAfter for middleware ${i + 1} of ${middlewares.length}`);
        response = await middlewares[i].runAfter(response, ev, context);
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
