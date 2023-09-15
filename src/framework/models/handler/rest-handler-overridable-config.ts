import { AHMiddleware } from "../../features/middleware/middleware";
import { AHHandlerOptions } from "./handler-options";
import { AHRestHandlerCacheConfig } from "../rest-handler-cache-config";


export interface AHRestHandlerOverridableConfig {
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHRestHandlerCacheConfig;
  options?: AHHandlerOptions;
}
