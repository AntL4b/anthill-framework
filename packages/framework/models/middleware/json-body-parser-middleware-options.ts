export interface AHJsonBodyParserMiddlewareOptions {
  reviver?: (this: any, key: string, value: any) => any;
}
