/* import { AHRestHandlerOverridableConfig } from "../models/handler/rest-handler-overridable-config";

type Constructor<T = {}> = new (...args: any[]) => T;

export function RestController(restControllerOptions: AHRestHandlerOverridableConfig): any {
  return <Class extends Constructor>(
    Value: Class,
    context: ClassDecoratorContext<Class>
  ) => {
    const _this = this;
    return class extends Value {
      constructor(...args: any[]) {
        super(...args);
        _this.instances.add(this);
      }
    };
  };
} */