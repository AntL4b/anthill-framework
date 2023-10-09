import { HttpRequestCache } from "../../../core/cache/http-request-cache";
import { AwsEvent } from "../../models/aws/event/aws-event";
import { HttpResponseBodyStatusEnum } from "../../models/enums/http-response-body-status-enum";
import { RestMethodEnum } from "../../models/enums/rest-method-enum";
import { HttpResponse } from "../http-response";
import { Logger } from "../logger";
import { Middleware } from "../middleware/middleware";
import { RestHandlerConfig } from "../../models/handler/rest-handler-config";
import { TimeTracker } from "../time-tracker";
import { AbstractRequestHandler } from "../../../core/abstract-request-handler";
import { AwsContext } from "../../models/aws/aws-context";
import { Anthill } from "../anthill";
import { RestHandlerCacheConfig } from "../../models/rest-handler-cache-config";
import { AwsCallback } from "../../models/aws/aws-callback";
import { RestControllerClass } from "../../../core/models/rest-controller-class";

export class RestRequestHandler extends AbstractRequestHandler<AwsEvent, HttpResponse> {
  private cacheConfig: RestHandlerCacheConfig = {};
  private httpCache: HttpRequestCache = new HttpRequestCache();
  private method: RestMethodEnum;
  private middlewares: Array<Middleware<any>> = [];

  constructor(params: RestHandlerConfig) {
    // Apply restHandlerConfig options
    super(params);

    this.method = params.method;

    if (params.middlewares) {
      this.middlewares = params.middlewares;
    }

    if (params.cacheConfig) {
      this.setCacheConfig(params.cacheConfig);
    }
  }

  /**
   * Set a new cache config
   * @param cacheConfig The cache config to be set
   */
  setCacheConfig(cacheConfig: RestHandlerCacheConfig): void {
    this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
  }

  /**
   * Add a middleware to the middleware pipeline execution
   * @param middleware
   */
  addMiddleware(middleware: Middleware<any>): void {
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
  async handleRequest(event: AwsEvent, context?: AwsContext, callback?: AwsCallback): Promise<HttpResponse> {
    const tracker: TimeTracker = new TimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      // Compute the multi level config into the one to be applied
      const cacheConfig: RestHandlerCacheConfig = this.computeCacheConfig();

      // Make event an instance of AwsEvent
      let _event: AwsEvent = new AwsEvent();
      Object.assign(_event, event);

      Logger.getInstance().debug("Handling request");
      Logger.getInstance().debug(`Method: ${this.method}`);
      Logger.getInstance().debug(`Name: ${this.name}`);

      if (cacheConfig.cacheable) {
        tracker.startSegment("cache-configuration");
        this.httpCache.setConfig(cacheConfig);
        this.httpCache.flushCache(cacheConfig.ttl);
        tracker.stopSegment("cache-configuration");
      }

      // Set default response
      let response: HttpResponse = null;

      // Init middleware data with an empty object
      _event.middlewareData = {};

      tracker.startSegment(`middleware-runBefore`);

      // Add anthill and controller configuration middlewares to middleware list
      const middlewares = await this.computeMiddlewares();

      // Save the last used middleware index to avoid calling runAfter on middleware that diddn't run runBefore (if a runBefore returns an HttpResponse)
      let lastMiddlewareIndex = -1;

      // Run all the middlewares runBefore one by one
      for (let i = 0; i < middlewares.length; i++) {
        Logger.getInstance().debug(`Running runBefore for middleware ${i + 1} of ${middlewares.length}`);

        lastMiddlewareIndex = i;
        const middlewareResult = await middlewares[i].runBefore(_event, context);

        // The middleware returned an AwsEvent
        if (middlewareResult instanceof AwsEvent) {
          _event = middlewareResult;
        } else {
          // The middleware returned an HttpResponse
          Logger.getInstance().debug("Middleware returned an HTTP response");

          // Save the middleware result inside the response and end the middleware loop
          response = middlewareResult;
          break;
        }
      }

      tracker.stopSegment(`middleware-runBefore`);

      // Try to retrieve any eventual cached response if cacheable option is set
      if (response === null && cacheConfig.cacheable) {
        tracker.startSegment("cache-retrieving");

        Logger.getInstance().debug("Try to get last http response from cache");
        response = this.httpCache.getCacheItem(
          HttpRequestCache.buildCacheRequestParameters(_event, cacheConfig.headersToInclude),
        );

        if (response !== null) {
          Logger.getInstance().debug("Last http response successfully retrieved from cache");
        }

        tracker.stopSegment("cache-retrieving");
      }

      if (response === null) {
        // Now run the handler callable function
        Logger.getInstance().debug("Running handler callable");

        tracker.startSegment("callable-run");

        try {
          const controllerInstance = await this.getControllerInstance();
          response = await this.callable.call(controllerInstance, ...[_event, context, callback]);
        } catch (e) {
          Logger.getInstance().error((e as { message: string }).message);
          response = HttpResponse.error({
            status: HttpResponseBodyStatusEnum.Error,
            message: (e as { message: string }).message,
          });
        }

        tracker.stopSegment("callable-run");

        if (cacheConfig.cacheable) {
          this.httpCache.addDataInCache(
            HttpRequestCache.buildCacheRequestParameters(_event, cacheConfig.headersToInclude),
            response,
          );
        }
      }

      tracker.startSegment(`middleware-runAfter`);

      // Run the middlewares runAfter one by one (avoid calling runAfter if runBefore wasn't called in case a runBefore returned an HttpResponse)
      for (let i = lastMiddlewareIndex; i >= 0; i--) {
        Logger.getInstance().debug(`Running runAfter for middleware ${i + 1} of ${middlewares.length}`);
        response = await middlewares[i].runAfter(response, _event, context);
      }

      tracker.stopSegment(`middleware-runAfter`);
      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);

      return response;
    } catch (e) {
      Logger.getInstance().error((e as { message: string }).message);

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);

      return HttpResponse.error({
        status: HttpResponseBodyStatusEnum.Error,
        message: (e as { message: string }).message,
      });
    }
  }

  private computeCacheConfig(): RestHandlerCacheConfig {
    const headersToInclude = [];

    if (
      Anthill.getInstance()._configuration.restHandlerConfig?.cacheConfig?.headersToInclude &&
      Anthill.getInstance()._configuration.restHandlerConfig.cacheConfig.headersToInclude.length
    ) {
      headersToInclude.push(...Anthill.getInstance()._configuration.restHandlerConfig.cacheConfig.headersToInclude);
    }

    const controllerInstance = this.getControllerInstance<any>();

    if (
      controllerInstance._restHandlerConfig?.cacheConfig?.headersToInclude &&
      controllerInstance._restHandlerConfig.cacheConfig.headersToInclude.length
    ) {
      headersToInclude.push(...controllerInstance._restHandlerConfig.cacheConfig.headersToInclude);
    }

    if (this.cacheConfig?.headersToInclude && this.cacheConfig?.headersToInclude.length) {
      headersToInclude.push(...this.cacheConfig.headersToInclude);
    }

    return {
      ...Anthill.getInstance()._configuration.restHandlerConfig?.cacheConfig,
      ...controllerInstance._restHandlerConfig?.cacheConfig,
      ...this.cacheConfig,
      headersToInclude: Array.from(new Set(headersToInclude)),
    };
  }

  private async computeMiddlewares(): Promise<Array<Middleware<any>>> {
    // Retrieve the controller instance
    const controllerInstance: InstanceType<RestControllerClass> = await this.getControllerInstance();

    const middlewares = [];

    if (
      Anthill.getInstance()._configuration.restHandlerConfig.middlewares &&
      Anthill.getInstance()._configuration.restHandlerConfig.middlewares.length
    ) {
      middlewares.push(...Anthill.getInstance()._configuration.restHandlerConfig.middlewares);
    }

    if (
      controllerInstance._restHandlerConfig?.middlewares &&
      controllerInstance._restHandlerConfig.middlewares.length
    ) {
      middlewares.push(...controllerInstance._restHandlerConfig.middlewares);
    }

    if (this.middlewares && this.middlewares.length) {
      middlewares.push(...this.middlewares);
    }

    return middlewares;
  }
}
