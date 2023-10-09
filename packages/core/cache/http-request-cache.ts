import { ObjectHelper } from "../../framework/helpers/object-helper";
import { AwsEvent } from "../../framework/models/aws/event/aws-event";
import { CacheData } from "../models/cache/cache-data";
import { HttpResponse } from "../../framework/features/http-response";
import { Cache } from "./cache";
import { HttpRequestParameters } from "../models/cache/http-request-parameters";
import { HttpRequestHelper } from "../../framework/helpers/http-request-helper";

export class HttpRequestCache extends Cache<HttpRequestParameters, HttpResponse> {
  /**
   * Get a cache item with its id
   * @param id The Id of the item to find inside the cache
   * @returns The cache item if found, null otherwise
   */
  getCacheItem(id: HttpRequestParameters): HttpResponse {
    return super._getCacheItem((data: CacheData<HttpRequestParameters, HttpResponse>) => {
      return (
        data.id.path === id.path &&
        ObjectHelper.isEquivalentObj(data.id.pathParameters, id.pathParameters) &&
        ObjectHelper.isEquivalentObj(data.id.queryStringParameters, id.queryStringParameters) &&
        ObjectHelper.isEquivalentObj(data.id.headersIncluded, id.headersIncluded)
      );
    });
  }

  /**
   * Build the http cache request based on the event
   * @param event The event to build the cache request with
   * @param headersToInclude Headers that have to be taken into an account for request identification
   * @returns The cache request parameters
   */
  static buildCacheRequestParameters(event: AwsEvent, headersToInclude: Array<string> = []): HttpRequestParameters {
    return {
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      headersIncluded: headersToInclude?.reduce((acc, header) => {
        acc[header] = HttpRequestHelper.getHeaderValue(header, event.headers);
        return acc;
      }, {}),
    };
  }
}
