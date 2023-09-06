import { AHAwsEvent } from "../..";
import { AHAbstractHandler } from "../../core/abstract-handler";
import { AHAwsContext } from "../models/aws/aws-context";
import { AHException } from "./anthill-exception";
import { AHLambdaHandler } from "./handler/lambda-handler";
import { AHRestHandler } from "./handler/rest-handler";

export class Anthill {
  private static instance: Anthill;
  private static handlerNames: Array<string>;
  private static restHandlers: Array<AHRestHandler>;
  private static lambdaHandlers: Array<AHLambdaHandler<any, any>>;

  private constructor() {
    Anthill.restHandlers = [];
    Anthill.lambdaHandlers = [];
    Anthill.handlerNames = [];
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
   * Register a rest handler
   * @param restHandler The handler to register
   */
  registerRestHandler(restHandler: AHRestHandler): void {
    this.registerHandlerName(restHandler.getName());
    Anthill.restHandlers.push(restHandler);
  }

  /**
   * Register a lambda handler
   * @param lambdaHandler The handler to register
   */
  registerLambdaHandler(lambdaHandler: AHLambdaHandler<any, any>): void {
    this.registerHandlerName(lambdaHandler.getName());
    Anthill.lambdaHandlers.push(lambdaHandler);
  }

  private registerHandlerName(handlerName: string) {
    if (Anthill.handlerNames.includes(handlerName)) {
      throw new AHException(
        `Duplicate handler with name ${handlerName}. Handler names must be unique within the application`,
      );
    }

    Anthill.handlerNames.push(handlerName);
  }

  /**
   * Expose all registred handlers
   * @returns All registred handlers mapped inside an object { [handlerName]: handler }
   */
  exposeHandlers(): { [handlerName: string]: AHAbstractHandler<any, any> } {
    const exportObject = {};

    // Expose rest handlers
    for (const handler of Anthill.restHandlers) {
      // Export a method that call the handler
      exportObject[handler.getName()] = async (event: AHAwsEvent, context: AHAwsContext) =>
        await handler.handleRequest(event, context);
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
