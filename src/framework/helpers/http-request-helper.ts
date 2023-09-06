export class AHHttpRequestHelper {

  /**
   * Find a header with its name ignoring case
   * @param header Header name
   * @param headers List of headers
   * @returns The header value if found, null otherwise
   */
    static getHeaderValue(header: string, headers: { [key: string]: string }): string {
      const headerKeys = headers ? Object.keys(headers) : [];
      const foundHeader = headerKeys.find(h => h.toLowerCase() === header.toLowerCase());
  
      return foundHeader ? headers[foundHeader] : null;
    }
}
