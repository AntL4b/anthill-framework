import { AHMiddleware } from "../../features/middleware/middleware";
import { AHRestHandlerCacheConfig } from "../rest-handler-cache-config";
import { AHAbstractHandlerOverridableConfig } from "../../../core/models/handler/abstract-handler-overridable-config";

export interface AHRestHandlerOverridableConfig extends AHAbstractHandlerOverridableConfig {
  middlewares?: Array<AHMiddleware<any>>;
  cacheConfig?: AHRestHandlerCacheConfig;
}
