import { AHLogLevelEnum } from "../enums/log-level-enum";
import { AHLoggerContext } from "./logger-context";

export type AHLoggerHandler = (message: string, logLevel: AHLogLevelEnum, context: AHLoggerContext) => void;
