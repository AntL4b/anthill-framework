import { LogLevelEnum } from "../enums/log-level-enum";

/* Used by all handlers */
export interface AnthillOptions {
  displayPerformanceMetrics?: boolean;
  defaultLogLevel?: LogLevelEnum;
}
