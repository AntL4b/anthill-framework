import { HttpResponseBodyStatusEnum } from "./enums/http-response-body-status-enum";

export interface HttpResponseBody {
  status?: HttpResponseBodyStatusEnum;
  message?: string;
  partial?: boolean;
  meta?: any;
  payload?: any;
}
