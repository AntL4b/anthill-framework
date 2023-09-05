import { AHHttpResponseBodyStatusEnum } from './enums/http-response-body-status-enum';


export interface AHHttpResponseBody {
  status?: AHHttpResponseBodyStatusEnum;
  message?: string;
  partial?: boolean;
  meta?: any;
  payload?: any;
}
