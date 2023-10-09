import { LogLevelEnum } from "../enums/log-level-enum";
import { LoggerContext } from "./logger-context";

export type LoggerHandler = (messages: Array<string>, logLevel: LogLevelEnum, context: LoggerContext) => void;
