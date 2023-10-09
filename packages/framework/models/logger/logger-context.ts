import { EnvEnum } from "../enums/env-enum";
import { LogLevelEnum } from "../enums/log-level-enum";

export interface LoggerContext {
  logLevel: LogLevelEnum;
  environment: EnvEnum;
}
