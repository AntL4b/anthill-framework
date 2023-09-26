import { AHMiddleware } from "../../features/middleware/middleware";
import { AHRestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface AHRestHandlerOverridableConfig {
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHRestHandlerCacheConfig;
}
