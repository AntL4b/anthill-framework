import { AHEnvEnum } from "../enums/env-enum";
import { AHLogLevelEnum } from "../enums/log-level-enum";

export interface AHLoggerContext {
  logLevel: AHLogLevelEnum;
  environment: AHEnvEnum;
}
