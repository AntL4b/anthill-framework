import { AHLogLevelEnum } from "../enums/log-level-enum";

/* Used by all handlers */
export interface AHAnthillOptions {
  displayPerformanceMetrics?: boolean;
  defaultLogLevel?: AHLogLevelEnum;
}
