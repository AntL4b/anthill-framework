
import { AHCacheConfig } from '../../core/models/cache/cache-config';
import { AHAbstractMiddleware } from '../middleware/abstract-middleware';
import { AHAwsEvent } from './aws/event/aws-event';
import { AHRestMethodEnum } from './enums/rest-method-enum';
import { AHHttpResponse } from './http/http-response';

export interface AHRestHandlerParams {
  name: string;
  method: AHRestMethodEnum;
  callable: (event: AHAwsEvent) => Promise<AHHttpResponse>;
  middlewares?: Array<AHAbstractMiddleware>;
  cacheConfig?: AHCacheConfig;
}
