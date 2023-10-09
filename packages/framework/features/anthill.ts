import { AwsContext } from "../models/aws/aws-context";
import { AnthillException } from "./anthill-exception";
import { AnthillConfig } from "../models/anthill/anthill-config";
import { AbstractRequestHandler } from "../../core/abstract-request-handler";
import { Callable } from "../models/handler/callable";
import { AnthillOptions } from "../models/anthill/anthill-options";
import { RestHandlerCacheConfig } from "../models/rest-handler-cache-config";
import { DependencyContainer } from "../../core/dependency-container";
import { AwsCallback } from "../models/aws/aws-callback";
import { LogLevelEnum } from "../models/enums/log-level-enum";
import { Logger } from "../features/logger";

export class Anthill {
  private static defaultRestHandlerCacheConfig: RestHandlerCacheConfig = {
    cacheable: false,
    ttl: 120,
    maxCacheSize: 1000000,
    headersToInclude: [],
  };

  private static defaultOptions: AnthillOptions = {
    displayPerformanceMetrics: false,
    defaultLogLevel: LogLevelEnum.Info,
  };

  private static instance: Anthill;

  private handlers: Array<AbstractRequestHandler<any, any>>;
  private registeredControllerNames: Array<string>;

  // Shouldn't be set directly by user
  _dependencyContainer: DependencyContainer;
  _configuration: AnthillConfig;

  private constructor() {
    this.handlers = [];
    this.registeredControllerNames = [];

    this._dependencyContainer = new DependencyContainer();

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
  configure(anthillConfig: AnthillConfig): void {
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

    Logger.getInstance().setLogLevel(this._configuration.options.defaultLogLevel);
  }

  /**
   * Register a rest handler (shouldn't be called manually unless you know what you're doing)
   * @param handler The handler to register
   */
  _registerHandler(handler: AbstractRequestHandler<any, any>): void {
    if (this.handlers.map((h) => h.getName()).includes(handler.getName())) {
      throw new AnthillException(
        `Duplicate handler with name ${handler.getName()}. Handler names must be unique within the application`,
      );
    }

    this.handlers.push(handler);
  }

  /**
   * Expose all registred handlers
   * @returns All registred handlers mapped inside an object { [handlerName]: handler }
   */
  exposeHandlers(): { [handlerName: string]: Callable<any, any> } {
    const exportObject = {};

    // Expose rest handlers
    for (const handler of this.handlers) {
      if (this.registeredControllerNames.includes(handler.controllerName)) {
        // Export a method that call the handler
        exportObject[handler.getName()] = async (event: any, context: AwsContext, callback: AwsCallback) =>
          await handler.handleRequest(event, context, callback);
      }
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
