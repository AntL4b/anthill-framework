export interface HttpRequestParameters {
  path: string;
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  headersIncluded?: { [key: string]: string };
}
