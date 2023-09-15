import { AHAwsContext } from "../models/aws/aws-context";
import { AHException } from "./anthill-exception";
import { AHAnthillConfig } from "../models/anthill-config";
import { AHAbstractHandler } from "../../core/abstract-handler";
import { AHCallable } from "../models/handler/callable";
import { AHHandlerOptions } from "../models/handler/handler-options";
import { AHRestHandlerCacheConfig } from "../models/rest-handler-cache-config";

export class Anthill {

  private static defaultRestHandlerCacheConfig: AHRestHandlerCacheConfig = {
    cachable: false,
    ttl: 120,
    maxCacheSize: 1000000,
    headersToInclude: [],
  };

  private static handlerDefaultOptions: AHHandlerOptions = {
    displayPerformanceMetrics: false,
  };

  private static instance: Anthill;
  private handlers: Array<AHAbstractHandler<any, any>>;

  // Shouldn't be set directly by user
  _configuration: AHAnthillConfig;

  private constructor() {
    this.handlers = [];

    // Default configuration if configure isn't called
    this._configuration = {
      restHandlerConfig: {
        middlewares: [],
        cacheConfig: Anthill.defaultRestHandlerCacheConfig,
        options: Anthill.handlerDefaultOptions
      },
      lambdaHandlerConfig: {
        options: Anthill.handlerDefaultOptions,
      }
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
  configure(anthillConfig?: AHAnthillConfig): void {
    anthillConfig = { ...anthillConfig }; // Will be an empty object even if anthillConfig is null

    // Apply configuration on top of default configuration
    this._configuration = {
      restHandlerConfig: {
        cacheConfig: { ...this._configuration.restHandlerConfig.cacheConfig, ...anthillConfig?.restHandlerConfig?.cacheConfig },
        middlewares: anthillConfig?.restHandlerConfig?.middlewares || [],
        options: { ...this._configuration.restHandlerConfig.options, ...anthillConfig?.restHandlerConfig?.options },
      },
      lambdaHandlerConfig: {
        options: { ...this._configuration.lambdaHandlerConfig.options, ...anthillConfig?.lambdaHandlerConfig?.options },
      }
    };
  }

  /**
   * Register a rest handler (shouldn't be called manually unless you know what you're doing)
   * @param handler The handler to register
   */
  _registerHandler(handler: AHAbstractHandler<any, any>): void {
    if (this.handlers.map(h => h.getName()).includes(handler.getName())) {
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
      // Export a method that call the handler
      exportObject[handler.getName()] = async (event: any, context: AHAwsContext, callback: (...args: Array<any>) => any) =>
        await handler.handleRequest(event, context, callback);
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
