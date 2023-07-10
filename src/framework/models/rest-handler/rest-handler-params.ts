
import { AHCacheConfig } from '../cache-config';
import { AHAbstractMiddleware } from '../../features/middlewares/abstract-middleware';
import { AHCallable } from './callable';
import { AHRestMethodEnum } from '../enums/rest-method-enum';
import { AHRestHandlerOptions } from './rest-handler-options';


export interface AHRestHandlerParams {
  name: string;
  method: AHRestMethodEnum;
  callable: AHCallable;
  middlewares?: Array<AHAbstractMiddleware<any>>;
  cacheConfig?: AHCacheConfig;
  options?: AHRestHandlerOptions;
}
