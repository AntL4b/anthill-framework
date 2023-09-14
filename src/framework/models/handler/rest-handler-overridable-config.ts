
import { AHCacheConfig } from "../cache-config";
import { AHMiddleware } from "../../features/middleware/middleware";
import { AHHandlerOptions } from "./handler-options";


export interface AHRestHandlerOverridableConfig {
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHCacheConfig;
  options?: AHHandlerOptions;
}
