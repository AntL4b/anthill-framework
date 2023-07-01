import { AHHttpResponseBodyMetaData } from './http-response-body-meta-data';
import { AHHttpResponseBodyStatusEnum } from '../enums/http-response-body-status-enum';

export interface AHHttpResponseBody {
  status?: AHHttpResponseBodyStatusEnum;
  message?: string;
  partial?: boolean;
  meta?: AHHttpResponseBodyMetaData;
  payload?: any;
}
