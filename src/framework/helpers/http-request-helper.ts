import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHBaseHttpRequest } from "../../models/http/base-http-request";
import { AHPager } from "../../models/http/pager";


export class AHHttpRequestHelper {
  
  /**
   * Add the base HTTP request part of an Aws request to a AHRequest object
   * @param request The request into whom add the base HTTP request parameters
   * @param awsEvent The Aws Event of the request
   * @returns The AHRequest object with the base HTTP request parameters added
   */
  static addBaseHttpRequest(request: any & AHBaseHttpRequest, awsEvent: AHAwsEvent): any & AHBaseHttpRequest {
    // Build pager
    const pager: AHPager = {
      page: awsEvent.queryStringParameters?.page ? parseInt(awsEvent.queryStringParameters?.page) : null,
      pageSize: awsEvent.queryStringParameters?.pageSize ? parseInt(awsEvent.queryStringParameters?.pageSize) : null,
    };

    // Return the AHRequest with pager and continuationToken
    return {
      ...request,
      pager: pager,
      continuationToken: awsEvent.queryStringParameters?.continuationToken || null,
    };
  }

  /**
   * Find a header with its name ignoring case
   * @param header Header name
   * @param awsEvent Aws event
   * @returns The header value if found, null otherwise
   */
  static getHeaderValue(header: string, awsEvent: AHAwsEvent): string {
    const headerKeys = awsEvent.headers ? Object.keys(awsEvent.headers) : [];
    const foundHeader = headerKeys.find(h => h.toLowerCase() === header.toLowerCase());

    return foundHeader ? awsEvent.headers[foundHeader] : null;
  }
}
