import { AnthillException } from "../framework/features/anthill-exception";
import { Constructible } from "./models/constructible";
import { DependencyContainerMap } from "./models/dependency-container-map";

export class DependencyContainer {
  private container: DependencyContainerMap = {};

  /**
   * Register a contructor in order to be able to instanciate it on demand later if no instance are given
   * @param identifier The constructor (i.e. class) identifier
   * @param constructor The constructor function
   * @param instance The instance to use as initial value
   */
  register<T>(identifier: string, constructor: Constructible<T>, instance: T = null): void {
    if (!Object.keys(this.container).includes(identifier)) {
      this.container[identifier] = {
        constructor: constructor,
        instance: instance,
      };
    }
  }

  /**
   * Resolve a given constructor (i.e. class) identifier to the matching instance
   * @param identifier The constructor (i.e. class) identifier
   * @returns The instance matching with constructor identifier
   */
  resolve<T>(identifier: string): T {
    if (!Object.keys(this.container).includes(identifier)) {
      throw new AnthillException(`Dependency ${identifier} has never been registered`);
    }

    if (!this.container[identifier].instance) {
      this.container[identifier].instance = new this.container[identifier].constructor();
    }

    return this.container[identifier].instance as T;
  }
}
