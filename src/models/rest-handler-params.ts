
import { AHAwsEvent } from './aws/event/aws-event';
import { AHCacheConfig } from './cache/cache-config';
import { AHHttpResponse } from './http/http-response';
import { AHRestMethodEnum } from './enums/rest-method-enum';
import { AHAbstractMiddleware } from '../middleware/abstract-middleware';

export interface AHRestHandlerParams {
  name: string;
  method: AHRestMethodEnum;
  callable: (event: AHAwsEvent) => Promise<AHHttpResponse>;
  middlewares?: Array<AHAbstractMiddleware>;
  cacheConfig?: AHCacheConfig;
}
