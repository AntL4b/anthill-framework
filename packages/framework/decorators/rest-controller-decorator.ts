import { RestHandlerOverridableConfig } from "../models/handler/rest-handler-overridable-config";
import { RestControllerClass } from "../../core/models/rest-controller-class";
import { Anthill } from "../features/anthill";

/**
 * REST controller decorator used to decorate controller classes
 * @param restControllerOptions REST handler options that will be applied to all handlers inside the controller class
 * @returns The REST controller decorator
 */
export function RestController(restControllerOptions: RestHandlerOverridableConfig = {}): any {
  return <T extends RestControllerClass>(target: T, context: ClassDecoratorContext<T>) => {
    Anthill.getInstance()._dependencyContainer.register(context.name, target);
    Anthill.getInstance()._dependencyContainer.resolve<T>(context.name)._restHandlerConfig = restControllerOptions;

    target.prototype._controllerName = context.name;
    return target;
  };
}
