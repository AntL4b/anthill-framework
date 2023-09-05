import { AHAwsEvent } from "../models/aws/event/aws-event";


export class AHHttpRequestHelper {

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
