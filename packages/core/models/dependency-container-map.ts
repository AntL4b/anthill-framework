export interface DependencyContainerMap {
  [key: string]: {
    constructor: new () => any;
    instance: any;
  };
}
