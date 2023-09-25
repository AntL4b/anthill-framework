import { AHException } from "../framework/features/anthill-exception";
import { AHDependencyContainerMap } from "./models/dependency-container-map";


export class AHDependencyContainer {
  private container: AHDependencyContainerMap = {};

  register<T>(identifier: string, constructor: new () => T) {
    console.log("registering " + identifier);
    
    if (!Object.keys(this.container).includes(identifier)) {
      this.container[identifier] = {
        constructor: constructor,
        instance: null,
      };
    }
  }

  resolve<T>(identifier: string): T {
    console.log("resolving " + identifier);
    
    if (!Object.keys(this.container).includes(identifier)) {
      throw new AHException(`Dependency ${identifier} has never been registered`);
    }

    if (!this.container[identifier].instance) {
      this.container[identifier].instance = new this.container[identifier].constructor();
    }

    return this.container[identifier].instance;
  }
}