export interface AHDependencyContainerMap {
  [key: string]: {
    constructor: new () => any;
    instance: any;
  };
}
