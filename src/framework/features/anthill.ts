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
   * @param restHandler The handler to register
   */
  registerRestHandler(restHandler: AHRestHandler): void {
    if (Anthill.restHandlers.find((_restHandler) => _restHandler.getName() === restHandler.getName())) {
      throw new AHException(
        `Duplicate handler with name ${restHandler.getName()}. Handler names must be unique within the application`,
      );
    }

    Anthill.restHandlers.push(restHandler);
  }
}

export function anthill(): Anthill {
  return Anthill.getInstance();
}
