import { LambdaHandlerOverridableConfig } from "../models/handler/lambda-handler-overridable-config";
import { LambdaControllerClass } from "../../core/models/lambda-controller-class";
import { Anthill } from "../features/anthill";

/**
 * Lambda controller decorator used to decorate controller classes
 * @param lambdaControllerOptions Lambda handler options that will be applied to all handlers inside the controller class
 * @returns The lambda controller decorator
 */
export function LambdaController(lambdaControllerOptions: LambdaHandlerOverridableConfig = {}): any {
  return <T extends LambdaControllerClass>(target: T, context: ClassDecoratorContext<T>) => {
    Anthill.getInstance()._dependencyContainer.register(context.name, target);
    Anthill.getInstance()._dependencyContainer.resolve<T>(context.name)._lambdaHandlerConfig = lambdaControllerOptions;

    target.prototype._controllerName = context.name;
    return target;
  };
}
