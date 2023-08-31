import { AHAwsEvent } from '../..';
import { AHAbstractHandler } from '../../core/abstract-handler';
import { AHAwsContext } from '../models/aws/aws-context';
import { AHException } from './anthill-exception';
import { AHRestHandler } from './rest-handler';


export class Anthill {
  private static instance: Anthill;
  private static handlerNames: Array<string>;
  private static restHandlers: Array<AHRestHandler>;

  private constructor() {
    Anthill.restHandlers = [];
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
   * Register a handler to be automatically exported in the index file
   * @param handler The handler to register
   */
  registerRestHandler(restHandler: AHRestHandler): void {
    if (Anthill.handlerNames.includes(restHandler.getName())) {
      throw new AHException(
        `Duplicate handler with name ${restHandler.getName()}. Handler names must be unique within the application`,
      );
    }

    Anthill.handlerNames.push(restHandler.getName());
    Anthill.restHandlers.push(restHandler);
  }

  /**
   * Expose all registred handlers
   * @returns All registred handlers mapped inside an object { [handlerName]: handler }
   */
  exposeHandlers(): { [handlerName: string]: AHAbstractHandler<any, any>} {
    const exportObject = {};

    // Expose rest handlers
    for (const handler of Anthill.restHandlers) {

      // Export a method that call the handler
      exportObject[handler.getName()] = async (event: AHAwsEvent, context: AHAwsContext) => await handler.handleRequest(event, context);
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
