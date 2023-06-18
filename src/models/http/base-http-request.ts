import { AHPager } from './pager';

export interface AHBaseHttpRequest {
  pager?: AHPager;
  continuationToken?: string;
}
