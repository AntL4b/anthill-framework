import { EnvEnum } from "../models/enums/env-enum";
import { LogLevelEnum } from "../models/enums/log-level-enum";
import { LoggerContext } from "../models/logger/logger-context";
import { EnvironmentHelper } from "../helpers/environment-helper";
import { LoggerFormatter } from "../models/logger/logger-formatter";
import { LoggerHandler } from "../models/logger/logger-handler";

export class Logger {
  private static instance: Logger;

  private logLevel: LogLevelEnum;
  private formatter: LoggerFormatter;
  private handlers: Array<LoggerHandler>;

  private constructor() {
    this.formatter = (payload: any) => {
      return JSON.stringify(payload, null, 2);
    };

    const env = EnvironmentHelper.getEnv();

    // Set default logs to debug if dev environment, info otherwise
    this.logLevel = EnvEnum.Dev === env ? LogLevelEnum.Debug : LogLevelEnum.Info;

    this.handlers = [
      (messages: Array<string>, logLevel: LogLevelEnum, context: LoggerContext) => {
        for (let message of messages) {
          console[logLevel](`${new Date().toISOString()} :: ${logLevel} :: ${message}`);
        }
      },
    ];
  }

  /**
   * Singleton getInstance method
   * @returns The singleton instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  /**
   * Set the formatter to format the payload before injecting it through the handlers pipeline
   * @param formatter: the formatter to be applied
   */
  setformatter(formatter: (payload: any) => string): void {
    this.formatter = formatter;
  }

  /**
   * Add a log handler
   * @param handler: the handler to be added
   */
  addHandler(handler: (message: Array<string>, logLevel: LogLevelEnum, context: LoggerContext) => void): void {
    this.handlers.push(handler);
  }

  /**
   * Remove all handlers
   */
  removeAllHandlers(): void {
    this.handlers = [];
  }

  /**
   * Define log level.
   * Incoming logs with lower importance than the log level will be ignored
   * @param logLevel: log level to be defined
   */
  setLogLevel(logLevel: LogLevelEnum): void {
    this.logLevel = logLevel;
  }

  /**
   * Log paylog with trace level
   * @param payload payload to be logged
   */
  trace(...payload: Array<any>): void {
    if ([LogLevelEnum.Trace].includes(this.logLevel)) {
      this.performLog(payload, LogLevelEnum.Debug, this.buildContext());
    }
  }

  /**
   * Log paylog with debug level
   * @param payload payload to be logged
   */
  debug(...payload: Array<any>): void {
    if ([LogLevelEnum.Trace, LogLevelEnum.Debug].includes(this.logLevel)) {
      this.performLog(payload, LogLevelEnum.Debug, this.buildContext());
    }
  }

  /**
   * Log paylog with info level
   * @param payload payload to be logged
   */
  info(...payload: Array<any>): void {
    if ([LogLevelEnum.Trace, LogLevelEnum.Debug, LogLevelEnum.Info].includes(this.logLevel)) {
      this.performLog(payload, LogLevelEnum.Info, this.buildContext());
    }
  }

  /**
   * Log paylog with warn level
   * @param payload payload to be logged
   */
  warn(...payload: Array<any>): void {
    if (this.logLevel !== LogLevelEnum.Error) {
      this.performLog(payload, LogLevelEnum.Warn, this.buildContext());
    }
  }

  /**
   * Log paylog with error level
   * @param payload payload to be logged
   */
  error(...payload: Array<any>): void {
    this.performLog(payload, LogLevelEnum.Error, this.buildContext());
  }

  private performLog(payload: Array<any>, logLevel: LogLevelEnum, context: LoggerContext): void {
    payload = payload.map((p: any) => this.formatter(p));
    for (let index = 0; index < this.handlers.length; index++) {
      const handler = this.handlers[index];
      handler(payload, logLevel, context);
    }
  }

  private buildContext(): LoggerContext {
    return {
      logLevel: this.logLevel,
      environment: EnvironmentHelper.getEnv(),
    };
  }
}

export function logTrace(...payload: Array<any>): void {
  return Logger.getInstance().trace(...payload);
}

export function logDebug(...payload: Array<any>): void {
  return Logger.getInstance().debug(...payload);
}

export function logInfo(...payload: Array<any>): void {
  return Logger.getInstance().info(...payload);
}

export function logWarn(...payload: Array<any>): void {
  return Logger.getInstance().info(...payload);
}

export function logError(...payload: Array<any>): void {
  return Logger.getInstance().error(...payload);
}
