import { AHLambdaHandlerOverridableConfig } from "../models/handler/lambda-handler-overridable-config";
import { AHLambdaControllerClass } from "../../core/models/controller-class/lambda-controller-class";
import { Anthill } from "../features/anthill";

/**
 * Lambda controller decorator used to decorate controller classes
 * @param lambdaControllerOptions Lambda handler options that will be applied to all handlers inside the controller class
 * @returns The lambda controller decorator
 */
export function LambdaController(lambdaControllerOptions: AHLambdaHandlerOverridableConfig = {}): any {
  return <T extends AHLambdaControllerClass<T>>(target: T, context: ClassDecoratorContext<T>) => {
    Anthill.getInstance()._dependencyContainer.register<T>(context.name, target);
    Anthill.getInstance()._dependencyContainer.resolve<T>(context.name)._lambdaHandlerConfig = lambdaControllerOptions;

    return target;
  };
}