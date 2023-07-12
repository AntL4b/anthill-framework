import { AHAbstractHandler } from '../../core/abstract-handler';
import { AHException } from './anthill-exception';
import { AHRestHandler } from './rest-handler';


export class Anthill {
  private static instance: Anthill;
  private static restHandlers: Array<AHRestHandler>;

  private constructor() {
    Anthill.restHandlers = [];
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
    if (Anthill.restHandlers.find((_restHandler) => _restHandler.getName() === restHandler.getName())) {
      throw new AHException(
        `Duplicate handler with name ${restHandler.getName()}. Handler names must be unique within the application`,
      );
    }

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
      exportObject[handler.getName()] = handler;
    }

    return exportObject;
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
