import { AHObjectHelper } from "../../framework/helpers/object-helper";
import { AHAwsEvent } from "../../framework/models/aws/event/aws-event";
import { AHCacheData } from "../models/cache/cache-data";
import { AHHttpResponse } from "../../framework/models/http/http-response";
import { AHCache } from "./cache";
import { AHHttpRequestParameters } from "../models/cache/http-request-parameters";


export class AHHttpRequestCache extends AHCache<AHHttpRequestParameters, AHHttpResponse> {
  private static instance: AHHttpRequestCache;

  constructor() {
    super();
  }

  /**
   * Singleton getInstance method
   * @returns The singleton instance
   */
  static getInstance(): AHHttpRequestCache {
    if (!AHHttpRequestCache.instance) {
      AHHttpRequestCache.instance = new AHHttpRequestCache();
    }

    return AHHttpRequestCache.instance;
  }

  /**
   * Get a cache item with its id
   * @param id The Id of the item to find inside the cache
   * @returns The cache item if found, null otherwise
   */
  getCacheItem(id: AHHttpRequestParameters): AHHttpResponse {
    return super._getCacheItem((data: AHCacheData<AHHttpRequestParameters, AHHttpResponse>) => {
      return (
        data.id.path === id.path &&
        AHObjectHelper.isEquivalentObj(data.id.pathParameters, id.pathParameters) &&
        AHObjectHelper.isEquivalentObj(data.id.queryStringParameters, id.queryStringParameters)
      );
    });
  }

  /**
   * Build the http cache request based on the event
   * @param event The event to build the cache request with
   * @returns The cache request parameters
   */
  static buildCacheRequestParameters(event: AHAwsEvent): AHHttpRequestParameters {
    return {
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    };
  }
}
