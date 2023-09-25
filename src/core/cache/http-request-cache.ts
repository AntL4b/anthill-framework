import { AHObjectHelper } from "../../framework/helpers/object-helper";
import { AHAwsEvent } from "../../framework/models/aws/event/aws-event";
import { AHCacheData } from "../models/cache/cache-data";
import { AHHttpResponse } from "../../framework/features/http-response";
import { AHCache } from "./cache";
import { AHHttpRequestParameters } from "../models/cache/http-request-parameters";
import { AHHttpRequestHelper } from "../../framework/helpers/http-request-helper";

export class AHHttpRequestCache extends AHCache<AHHttpRequestParameters, AHHttpResponse> {
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
        AHObjectHelper.isEquivalentObj(data.id.queryStringParameters, id.queryStringParameters) &&
        AHObjectHelper.isEquivalentObj(data.id.headersIncluded, id.headersIncluded)
      );
    });
  }

  /**
   * Build the http cache request based on the event
   * @param event The event to build the cache request with
   * @param headersToInclude Headers that have to be taken into an account for request identification
   * @returns The cache request parameters
   */
  static buildCacheRequestParameters(event: AHAwsEvent, headersToInclude: Array<string> = []): AHHttpRequestParameters {
    return {
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      headersIncluded: headersToInclude?.reduce((acc, header) => {
        acc[header] = AHHttpRequestHelper.getHeaderValue(header, event.headers);
        return acc;
      }, {}),
    };
  }
}
