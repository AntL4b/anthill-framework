import { Middleware } from "../../features/middleware/middleware";
import { RestMethodEnum } from "../enums/rest-method-enum";
import { RestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface RestHandlerDecoratorConfig {
  method: RestMethodEnum;

  /**
   * Override handler name inside handler registry
   */
  name?: string;

  middlewares?: Array<Middleware<any>>;
  cacheConfig?: RestHandlerCacheConfig;
}
