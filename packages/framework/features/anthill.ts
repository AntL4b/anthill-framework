import { AHAwsContext } from "../models/aws/aws-context";
import { AHException } from "./anthill-exception";
import { AHAnthillConfig } from "../models/anthill/anthill-config";
import { AHAbstractHandler } from "../../core/abstract-handler";
import { AHCallable } from "../models/handler/callable";
import { AHAnthillOptions } from "../models/anthill/anthill-options";
import { AHRestHandlerCacheConfig } from "../models/rest-handler-cache-config";
import { AHDependencyContainer } from "../../core/dependency-container";
import { AHAwsCallback } from "../models/aws/aws-callback";
import { AHLogLevelEnum } from "../models/enums/log-level-enum";
import { AHLogger } from "../features/logger";

export class Anthill {
  private static defaultRestHandlerCacheConfig: AHRestHandlerCacheConfig = {
    cachable: false,
    ttl: 120,
    maxCacheSize: 1000000,
    headersToInclude: [],
  };

  private static defaultOptions: AHAnthillOptions = {
    displayPerformanceMetrics: false,
    defaultLogLevel: AHLogLevelEnum.Info,
  };

  private static instance: Anthill;

  private handlers: Array<AHAbstractHandler<any, any>>;
  private registeredControllerNames: Array<string>;

  // Shouldn't be set directly by user
  _dependencyContainer: AHDependencyContainer;
  _configuration: AHAnthillConfig;

  private constructor() {
    this.handlers = [];
    this.registeredControllerNames = [];

    this._dependencyContainer = new AHDependencyContainer();

    // Default configuration if configure isn't called
    this._configuration = {
      controllers: [],
      restHandlerConfig: {
        middlewares: [],
        cacheConfig: Anthill.defaultRestHandlerCacheConfig,
      },
      lambdaHandlerConfig: {},
      options: Anthill.defaultOptions,
    };
  }

  /**
   * Singleton getInstance method
   * @returns The singleton instance
   */
  static getInstance(): Anthill {
    if (!Anthill.instance) {
      Anthill.instance = new Anthill();
    }

    return Anthill.instance;
  }

  /**
   * Configure the anthill application
   * @param anthillConfig The configuration object for configuring an anthill application
   */
  configure(anthillConfig: AHAnthillConfig): void {
    // Apply configuration on top of default configuration
    this._configuration = {
      controllers: anthillConfig?.controllers || [],
      restHandlerConfig: {
        cacheConfig: {
          ...this._configuration.restHandlerConfig.cacheConfig,
          ...anthillConfig?.restHandlerConfig?.cacheConfig,
        },
        middlewares: anthillConfig?.restHandlerConfig?.middlewares || [],
      },
      lambdaHandlerConfig: {
        ...this._configuration.lambdaHandlerConfig,
        ...anthillConfig?.lambdaHandlerConfig,
      },
      options: {
        ...this._configuration.options,
        ...anthillConfig?.options,
      },
    };

    // Register controller names using their static property _controllerName
    this.registeredControllerNames = this._configuration.controllers.map((c) => c.prototype._controllerName);

    AHLogger.getInstance().setLogLevel(this._configuration.options.defaultLogLevel);
  }

  /**
   * Register a rest handler (shouldn't be called manually unless you know what you're doing)
   * @param handler The handler to register
   */
  _registerHandler(handler: AHAbstractHandler<any, any>): void {
    if (this.handlers.map((h) => h.getName()).includes(handler.getName())) {
      throw new AHException(
        `Duplicate handler with name ${handler.getName()}. Handler names must be unique within the application`,
      );
    }

    this.handlers.push(handler);
  }

  /**
   * Expose all registred handlers
   * @returns All registred handlers mapped inside an object { [handlerName]: handler }
   */
  exposeHandlers(): { [handlerName: string]: AHCallable<any, any> } {
    const exportObject = {};

    // Expose rest handlers
    for (const handler of this.handlers) {
      if (this.registeredControllerNames.includes(handler.controllerName)) {
        // Export a method that call the handler
        exportObject[handler.getName()] = async (event: any, context: AHAwsContext, callback: AHAwsCallback) =>
          await handler.handleRequest(event, context, callback);
      }
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
