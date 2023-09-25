import { AHLogLevelEnum } from "../enums/log-level-enum";
import { AHLoggerContext } from "./logger-context";

export type AHLoggerHandler = (messages: Array<any>, logLevel: AHLogLevelEnum, context: AHLoggerContext) => void;
