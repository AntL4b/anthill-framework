import { Anthill } from "../features/anthill";
import { AHRestHandlerOverridableConfig } from "../models/handler/rest-handler-overridable-config";

export function RestController(restControllerOptions: AHRestHandlerOverridableConfig): any {
  return <T extends { new (...args: any[]): T; _restHandlerConfig: AHRestHandlerOverridableConfig }>(
    target: T,
    context: ClassDecoratorContext<T>,
  ) => {
    Anthill.getInstance()._dependencyContainer.register<T>(context.name, target);
    Anthill.getInstance()._dependencyContainer.resolve<T>(context.name)._restHandlerConfig = restControllerOptions;

    return target;
  };
}
