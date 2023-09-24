import { AHException } from "../framework/features/anthill-exception";


class DependencyContainer {
  private instances: Map<string, any> = new Map();

  // Register a class constructor with a unique identifier
  register<T>(identifier: string, constructor: new () => T) {
    if (!this.instances.has(identifier)) {
      this.instances.set(identifier, constructor);
    }
  }

  // Resolve an instance by its identifier
  resolve<T>(identifier: string): T {
    const constructor = this.instances.get(identifier);

    if (!constructor) {
      throw new AHException(`Dependency not registered: ${identifier}`);
    }

    return new constructor();
  }
}