import { AHRestControllerClass } from "../../core/models/controller-class/rest-controller-class";
import { Anthill } from "../features/anthill";
import { AHRestHandlerOverridableConfig } from "../models/handler/rest-handler-overridable-config";

/**
 * REST controller decorator used to decorate controller classes
 * @param restControllerOptions REST handler options that will be applied to all handlers inside the controller class
 * @returns The REST controller decorator
 */
export function RestController(restControllerOptions: AHRestHandlerOverridableConfig = {}): any {
  return <T extends AHRestControllerClass<T>>(target: T, context: ClassDecoratorContext<T>) => {
    Anthill.getInstance()._dependencyContainer.register<T>(context.name, target);
    Anthill.getInstance()._dependencyContainer.resolve<T>(context.name)._restHandlerConfig = restControllerOptions;

    return target;
  };
}
