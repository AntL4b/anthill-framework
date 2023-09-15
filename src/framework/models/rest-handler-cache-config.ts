import { AHCacheConfig } from "../../core/models/cache/cache-config";


export interface AHRestHandlerCacheConfig extends AHCacheConfig {
  headersToInclude?: Array<string>;
}
