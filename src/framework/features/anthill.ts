import { AHAwsContext } from "../models/aws/aws-context";
import { AHException } from "./anthill-exception";
import { AHCallable } from "../..";
import { AHAbstractHandler } from "../../core/abstract-handler";

export class Anthill {
  private static instance: Anthill;
  private static handlers: Array<AHAbstractHandler<any, any>>;

  private constructor() {
    Anthill.handlers = [];
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
   * @param handler The handler to register
   */
  registerHandler(handler: AHAbstractHandler<any, any>): void {
    if (Anthill.handlers.map(h => h.getName()).includes(handler.getName())) {
      throw new AHException(
        `Duplicate handler with name ${handler.getName()}. Handler names must be unique within the application`,
      );
    }

    Anthill.handlers.push(handler);
  }

  /**
   * Expose all registred handlers
   * @returns All registred handlers mapped inside an object { [handlerName]: handler }
   */
  exposeHandlers(): { [handlerName: string]: AHCallable<any, any> } {
    const exportObject = {};

    // Expose rest handlers
    for (const handler of Anthill.handlers) {
      // Export a method that call the handler
      exportObject[handler.getName()] = async (event: any, context: AHAwsContext) =>
        await handler.handleRequest(event, context);
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
