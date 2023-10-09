import { CacheConfig } from "../../core/models/cache/cache-config";

export interface RestHandlerCacheConfig extends CacheConfig {
  headersToInclude?: Array<string>;
}
