export interface AHHttpRequestParameters {
  path: string;
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
}
