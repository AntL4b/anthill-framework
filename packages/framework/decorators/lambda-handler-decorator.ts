import { Anthill } from "../features/anthill";
import { LambdaRequestHandler } from "../features/handler/lambda-request-handler";
import { LambdaHandlerDecoratorConfig } from "../models/decorators/lambda-handler-decorator-config";
import { LambdaHandlerConfig } from "../models/handler/lambda-handler-config";

/**
 * Lambda handler decorator used to decorate handler method inside controller classes
 * @param lambdaHandlerOptions Lambda handler options that will be applied to this handler
 * @returns The lambda handler decorator
 */
export function LambdaHandler<T, A extends [any, ...undefined[]], R extends Promise<any> | any>(
  lambdaHandlerOptions: LambdaHandlerDecoratorConfig = {},
) {
  return (target: (this: T, ...args: A) => R, context: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>) => {
    if (!lambdaHandlerOptions.name) {
      lambdaHandlerOptions.name = String(context.name);
    }

    const _lambdaHandlerOptions: LambdaHandlerConfig<any, any> = {
      name: lambdaHandlerOptions.name,
      callable: target as any,
      ...lambdaHandlerOptions,
    };

    const lambdaHandler = new LambdaRequestHandler(_lambdaHandlerOptions);
    Anthill.getInstance()._registerHandler(lambdaHandler);

    context.addInitializer(function () {
      if (typeof this === "object") {
        // Instance method
        return (lambdaHandler.controllerName = this.constructor.name);
      } else {
        // static method
        return (lambdaHandler.controllerName = (this as any).name);
      }
    });

    return target;
  };
}
