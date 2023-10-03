import { AHMiddleware } from "../../features/middleware/middleware";
import { AHRestMethodEnum } from "../enums/rest-method-enum";
import { AHRestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface AHRestHandlerDecoratorConfig {
  method: AHRestMethodEnum;

  /**
   * Override handler name inside handler registry
   */
  name?: string;

  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHRestHandlerCacheConfig;
}
