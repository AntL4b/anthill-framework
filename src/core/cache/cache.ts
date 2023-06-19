import { AHSizeOfHelpers } from "../../framework/helpers/size-of-helper";
import { AHLogger } from "../../framework/logger";
import { AHCacheConfig } from "../../models/cache/cache-config";
import { AHCacheData } from "../../models/cache/cache-data";


export abstract class AHCache<T, U> {
  data: Array<AHCacheData<T, U>> = [];
  currentCacheSize: number = 0;
  cacheConfig: AHCacheConfig;

  constructor() {}

  /**
   * Set the cache config
   * @param cacheConfig The cache config to set
   */
  setConfig(cacheConfig: AHCacheConfig): void {
    this.cacheConfig = cacheConfig;
  }

  /**
   * Add data inside the cache
   * @param id Id of the data
   * @param data Data to add
   */
  addDataInCache(id: T, data: U): void {
    const dataToAdd = {
      id: id,
      data: data,
      date: new Date(),
    };

    const dataToAddSize = AHSizeOfHelpers.getSizeOf(dataToAdd);

    // Pass condition if this.cacheConfig.maxCacheSize is undefined
    if (dataToAddSize > this.cacheConfig.maxCacheSize) {
      AHLogger.getInstance().debug(
        `Data to add in cache is bigger than max cache size: ${dataToAddSize} > ${this.cacheConfig.maxCacheSize}`,
      );
      return;
    }

    // Delete data to free up space
    while (this.currentCacheSize + dataToAddSize > this.cacheConfig.maxCacheSize) {
      AHLogger.getInstance().debug(
        'Current cache size will exceed max cache size: older data in cache deleted to free up space',
      );
      this.currentCacheSize = this.currentCacheSize - AHSizeOfHelpers.getSizeOf(this.data[0]);
      this.data.splice(0, 1);
    }

    this.currentCacheSize = this.currentCacheSize + dataToAddSize;
    this.data.push(dataToAdd);
  }

  flushCache(ttl: number): void {
    this.data = this.data.filter((d) => {
      if (d.date.getTime() / 1000 > Date.now() / 1000 - ttl) {
        return true;
      } else {
        this.currentCacheSize = this.currentCacheSize - AHSizeOfHelpers.getSizeOf(d);
        return false;
      }
    });
  }

  abstract getCacheItem(id: T): U;

  protected _getCacheItem(findCallable: (data: AHCacheData<T, U>) => boolean): U {
    const cacheItem = this.data.find(findCallable);

    return cacheItem ? cacheItem.data : null;
  }
}
