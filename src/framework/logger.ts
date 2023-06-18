import { AHEnvEnum } from '../models/enums/env-enum';
import { AHLogLevelEnum } from '../models/enums/log-level-enum';
import { AHLoggerContext } from '../models/logger-context';
import { AHEnvironmentHelper } from './helpers/environment-helpers';


export class AHLogger {
  private logLevel: AHLogLevelEnum;
  private formatter: (payload: any) => string;
  private handlers: [(message: string, logLevel: AHLogLevelEnum, context: AHLoggerContext) => void];

  private static instance: AHLogger;

  private constructor() {
    this.formatter = (payload: string) => {
      return payload;
    };

    const env = AHEnvironmentHelper.getEnv();

    // Set default logs to debug if in local or dev environment, error otherwise
    this.logLevel = [AHEnvEnum.Dev].includes(env) ? AHLogLevelEnum.Debug : AHLogLevelEnum.Warn;

    this.handlers = [
      (message: string, logLevel: AHLogLevelEnum, context: AHLoggerContext) => {
        console[logLevel](`${new Date().toISOString()} :: ${logLevel} :: ${message}`);
      },
    ];
  }

  /**
   * Singleton getInstance method
   * @returns The singleton instance
   */
  static getInstance(): AHLogger {
    if (!AHLogger.instance) {
      AHLogger.instance = new AHLogger();
    }

    return AHLogger.instance;
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
  addHandler(handler: (message: string, logLevel: AHLogLevelEnum, context: AHLoggerContext) => void): void {
    this.handlers.push(handler);
  }

  /**
   * Define log level.
   * Incoming logs with lower importance than the log level will be ignored
   * @param logLevel: log level to be defined
   */
  setLogLevel(logLevel: AHLogLevelEnum): void {
    this.logLevel = logLevel;
  }

  /**
   * Log paylog with debug level
   * @param payload payload to be logged
   */
  debug(payload: any): void {
    if (this.logLevel === AHLogLevelEnum.Debug) {
      this.performLog(payload, AHLogLevelEnum.Debug, this.buildContext());
    }
  }

  /**
   * Log paylog with info level
   * @param payload payload to be logged
   */
  info(payload: any): void {
    if (this.logLevel === AHLogLevelEnum.Debug || this.logLevel === AHLogLevelEnum.Info) {
      this.performLog(payload, AHLogLevelEnum.Info, this.buildContext());
    }
  }

  /**
   * Log paylog with warn level
   * @param payload payload to be logged
   */
  warn(payload: any): void {
    if (this.logLevel !== AHLogLevelEnum.Error) {
      this.performLog(payload, AHLogLevelEnum.Warn, this.buildContext());
    }
  }

  /**
   * Log paylog with error level
   * @param payload payload to be logged
   */
  error(payload: any): void {
    this.performLog(payload, AHLogLevelEnum.Error, this.buildContext());
  }

  private performLog(payload: any, logLevel: AHLogLevelEnum, context: AHLoggerContext): void {
    for (let index = 0; index < this.handlers.length; index++) {
      const handler = this.handlers[index];
      handler(this.formatter(payload), logLevel, context);
    }
  }

  private buildContext(): AHLoggerContext {
    return {
      logLevel: this.logLevel,
      environment: AHEnvironmentHelper.getEnv(),
    };
  }
}
