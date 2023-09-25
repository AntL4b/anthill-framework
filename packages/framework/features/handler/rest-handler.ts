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
import { AHMultiLevelHandlerConfig } from "../../../core/models/handler/multi-level-handler-config";
import { AHHandlerConfigLevelEnum } from "../../models/enums/handler-config-level-enum";
import { AHAwsCallback } from "../../models/aws/aws-callback";
import { AHRestControllerClass } from "../../../core/models/controller-class/rest-controller-class";

export class AHRestHandler extends AHAbstractHandler<AHAwsEvent, AHHttpResponse> {
  private cacheConfig: AHMultiLevelHandlerConfig<AHRestHandlerCacheConfig> = {
    anthill: Anthill.getInstance()._configuration.restHandlerConfig.cacheConfig,
    controller: {},
    handler: {},
  };
  private httpCache: AHHttpRequestCache = new AHHttpRequestCache();
  private method: AHRestMethodEnum;
  private middlewares: Array<AHMiddleware<any>> = [];

  constructor(params: AHRestHandlerConfig) {
    // Apply restHandlerConfig options
    super(params);

    this.method = params.method;

    if (params.middlewares) {
      this.middlewares = params.middlewares;
    }

    if (Anthill.getInstance()._configuration.restHandlerConfig.options) {
      this.setOptions(Anthill.getInstance()._configuration.restHandlerConfig.options, AHHandlerConfigLevelEnum.Anthill);
    }

    if (params.cacheConfig) {
      this.setCacheConfig(params.cacheConfig, AHHandlerConfigLevelEnum.Handler);
    }
  }

  /**
   * Set a new cache config
   * @param cacheConfig The cache config to be set
   * @param configLevel The config level that should be applied for the given config
   */
  setCacheConfig(
    cacheConfig: AHRestHandlerCacheConfig,
    configLevel: AHHandlerConfigLevelEnum = AHHandlerConfigLevelEnum.Handler,
  ): void {
    this.cacheConfig[configLevel] = { ...this.cacheConfig[configLevel], ...cacheConfig };
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
  async handleRequest(event: AHAwsEvent, context?: AHAwsContext, callback?: AHAwsCallback): Promise<AHHttpResponse> {
    const tracker: AHTimeTracker = new AHTimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      // Apply controller instance config
      await this.setupControllerInstance();

      // Compute the multi level config into the one to be applied
      const cacheConfig: AHRestHandlerCacheConfig = this.computeCacheConfig();

      // Make event an instance of AHAwsEvent
      let _event: AHAwsEvent = new AHAwsEvent();
      Object.assign(_event, event);

      AHLogger.getInstance().debug("Handling request");
      AHLogger.getInstance().debug(`Method: ${this.method}`);
      AHLogger.getInstance().debug(`Name: ${this.name}`);

      if (cacheConfig.cachable) {
        tracker.startSegment("cache-configuration");
        this.httpCache.setConfig(cacheConfig);
        this.httpCache.flushCache(cacheConfig.ttl);
        tracker.stopSegment("cache-configuration");
      }

      // Set default response
      let response: AHHttpResponse = null;

      // Init middleware data with an empty object
      _event.middlewareData = {};

      tracker.startSegment(`middleware-runBefore`);

      // Add anthill and controller configuration middlewares to middleware list
      const middlewares = await this.computeMiddlewares();

      // Run all the middlewares runBefore one by one
      for (let i = 0; i < middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runBefore for middleware ${i + 1} of ${middlewares.length}`);

        const middlewareResult = await middlewares[i].runBefore(_event, context);

        // The middleware returned an AHAwsEvent
        if (middlewareResult instanceof AHAwsEvent) {
          _event = middlewareResult;
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
      if (response === null && cacheConfig.cachable) {
        tracker.startSegment("cache-retrieving");

        AHLogger.getInstance().debug("Try to get last http response from cache");
        response = this.httpCache.getCacheItem(
          AHHttpRequestCache.buildCacheRequestParameters(_event, cacheConfig.headersToInclude),
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
          const controllerInstance = await this.getControllerInstance();
          response = await this.callable.call(controllerInstance, ...[_event, context, callback]);
        } catch (e) {
          AHLogger.getInstance().error((e as { message: string }).message);
          response = AHHttpResponse.error({
            status: AHHttpResponseBodyStatusEnum.Error,
            message: (e as { message: string }).message,
          });
        }

        tracker.stopSegment("callable-run");

        if (cacheConfig.cachable) {
          this.httpCache.addDataInCache(
            AHHttpRequestCache.buildCacheRequestParameters(_event, cacheConfig.headersToInclude),
            response,
          );
        }
      }

      tracker.startSegment(`middleware-runAfter`);

      // Run all the middlewares runAfter one by one
      for (let i = 0; i < middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running runAfter for middleware ${i + 1} of ${middlewares.length}`);
        response = await middlewares[i].runAfter(response, _event, context);
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

  private computeCacheConfig(): AHRestHandlerCacheConfig {
    const headersToInclude = [];

    if (this.cacheConfig.anthill?.headersToInclude && this.cacheConfig.anthill?.headersToInclude.length) {
      headersToInclude.push(...this.cacheConfig.anthill?.headersToInclude);
    }

    if (this.cacheConfig.controller?.headersToInclude && this.cacheConfig.controller?.headersToInclude.length) {
      headersToInclude.push(...this.cacheConfig.controller?.headersToInclude);
    }

    if (this.cacheConfig.handler?.headersToInclude && this.cacheConfig.handler?.headersToInclude.length) {
      headersToInclude.push(...this.cacheConfig.handler?.headersToInclude);
    }

    return {
      ...this.cacheConfig.anthill,
      ...this.cacheConfig.controller,
      ...this.cacheConfig.handler,
      headersToInclude: Array.from(new Set(headersToInclude)),
    };
  }

  private async computeMiddlewares(): Promise<Array<AHMiddleware<any>>> {
    // Retrieve the controller instance
    const controllerInstance: InstanceType<AHRestControllerClass<any>> = await this.getControllerInstance();

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

  private async setupControllerInstance(): Promise<void> {
    // Retrieve the controller instance
    const controllerInstance = await this.getControllerInstance<InstanceType<AHRestControllerClass<any>>>();

    // Set the controller level config and options
    if (controllerInstance._restHandlerConfig?.options) {
      this.setOptions(controllerInstance._restHandlerConfig?.options, AHHandlerConfigLevelEnum.Controller);
    }

    if (controllerInstance._restHandlerConfig?.cacheConfig) {
      this.setCacheConfig(controllerInstance._restHandlerConfig?.cacheConfig, AHHandlerConfigLevelEnum.Controller);
    }
  }
}
