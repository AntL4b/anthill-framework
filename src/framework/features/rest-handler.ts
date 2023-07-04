import { AHHttpRequestCache } from "../../core/cache/http-request-cache";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHCacheConfig } from "../../core/models/cache/cache-config";
import { AHHttpResponseBodyStatusEnum } from "../models/enums/http-response-body-status-enum";
import { AHRestMethodEnum } from "../models/enums/rest-method-enum";
import { AHHttpResponse } from "../models/http/http-response";
import { AHLogger } from "./logger";
import { AHAbstractMiddleware } from "./middlewares/abstract-middleware";
import { AHRestHandlerParams } from "../models/rest-handler/rest-handler-params";
import { AHCallable } from "../models/rest-handler/callable";
import { AHException } from "./anthill-exception";
export class AHRestHandler {

  private static defaultCacheConfig: AHCacheConfig = {
    cachable: false,
    ttl: 120,
    maxCacheSize: 1000000,
  };

  private name: string;
  private method: AHRestMethodEnum;
  private middlewares: Array<AHAbstractMiddleware> = [];
  private callable: AHCallable;
  private cacheConfig: AHCacheConfig = AHRestHandler.defaultCacheConfig;

  constructor(params: AHRestHandlerParams) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(`Invalide handler name: ${params.name}. Handler name must respect typescript var naming convention`);
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
    if (cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
    }
  }

  /**
   * Add a middleware to the middleware pipeline execution
   * @param middleware 
   */
  addMiddleware(middleware: AHAbstractMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Handle the request.
   * Run all the middlewares one by one before running the handler callable function
   * @param event The event to be passed through middlewares and callable function
   * @returns An http response
   */
  async handleRequest(event: AHAwsEvent): Promise<AHHttpResponse> {
    try {
      // Make event an instance of AHAwsEvent
      let ev: AHAwsEvent = new AHAwsEvent();
      Object.assign(ev, event);

      AHLogger.getInstance().debug('Handling request');
      AHLogger.getInstance().debug('Method: ' + this.method);
      AHLogger.getInstance().debug('Name: ' + this.name);

      if (this.cacheConfig.cachable) {
        AHHttpRequestCache.getInstance().setConfig(this.cacheConfig);
        AHHttpRequestCache.getInstance().flushCache(this.cacheConfig.ttl);
      }

      // Init middleware data with an empty object
      ev.middlewareData = {};

      // Run all the middlewares one by one
      for (let i = 0; i < this.middlewares.length; i++) {
        AHLogger.getInstance().debug(`Running middleware ${i + 1} of ${this.middlewares.length}`);
        const middleware: AHAbstractMiddleware = this.middlewares[i];

        const middlewareResult = await middleware.run(ev);

        // The middleware returned an AHAwsEvent
        if (middlewareResult instanceof AHAwsEvent) {
          ev = middlewareResult;
        } else {
          // The middleware returned an HttpResponse
          AHLogger.getInstance().debug('Middleware returned an HTTP response');

          // End the request handle with this response
          return middlewareResult;
        }
      }

      if (this.cacheConfig.cachable) {
        AHLogger.getInstance().debug('Try to get last http response from cache');
        const cacheResponse = AHHttpRequestCache.getInstance().getCacheItem(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
        );

        if (cacheResponse) {
          AHLogger.getInstance().debug('Last http response successfully retrieved from cache');
          return cacheResponse;
        }
      }

      // Now run the handler callable function
      AHLogger.getInstance().debug('Running handler callable');
      const callableReponse = await this.callable(ev);

      if (this.cacheConfig.cachable) {
        AHHttpRequestCache.getInstance().addDataInCache(
          AHHttpRequestCache.buildCacheRequestParameters(ev),
          callableReponse,
        );
      }

      return callableReponse;
    } catch (e) {
      AHLogger.getInstance().error((e as { message: string }).message);
      return AHHttpResponse.error({
        status: AHHttpResponseBodyStatusEnum.Error,
        message: (e as { message: string }).message,
      });
    }
  }
}
