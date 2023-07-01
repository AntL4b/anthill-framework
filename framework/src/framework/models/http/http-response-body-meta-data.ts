import { AHPager } from './pager';

export interface AHHttpResponseBodyMetaData {
  serviceNumberOfItems?: number;
  payloadNumberOfItems?: number;
  appliedPager?: AHPager;
  [key: string]: any;
}
