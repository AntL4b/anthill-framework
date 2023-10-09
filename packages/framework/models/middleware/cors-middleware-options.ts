export interface CorsMiddlewareOptions {
  getOrigin?: Function;
  credentials?: boolean;
  headers?: string; // List of comma-separated header name or a wildcard for allowing all
  methods?: string; // List of comma-separated allowed method names or a wildcard for allowing all
  origin?: string; // Allowed origin
  origins?: Array<string>;
  exposeHeaders?: string; // A list of zero or more comma-separated header names that clients are allowed to access from a response or a wildcard for allowing all
  maxAge?: number; // indicates how long the results of a preflight request can be cached
  requestHeaders?: string; // A comma-delimited list of HTTP headers that are included in the request
  requestMethods?: string; // A comma-delimited list of the allowed HTTP request methods or a wildcard for allowing all
  cacheControl?: string; // lists directives that affect caching — both response directives and request directives
  vary?: string; // A comma-separated list of request header names that could have influenced the generation of this response or a wildcard if not relevant
}
