export interface JsonBodyParserMiddlewareOptions {
  reviver?: (this: any, key: string, value: any) => any;
}
