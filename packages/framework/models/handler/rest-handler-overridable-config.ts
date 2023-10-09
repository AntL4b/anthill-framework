import { Middleware } from "../../features/middleware/middleware";
import { RestHandlerCacheConfig } from "../rest-handler-cache-config";

export interface RestHandlerOverridableConfig {
  middlewares?: Array<Middleware<any>>;
  cacheConfig?: RestHandlerCacheConfig;
}
