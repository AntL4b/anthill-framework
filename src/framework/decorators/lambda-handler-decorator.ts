import { Anthill } from "../features/anthill";
import { AHLambdaHandler } from "../features/handler/lambda-handler";
import { AHLambdaHandlerConfig } from "../models/handler/lambda-handler-config";

/**
 * Lambda handler decorator used to decorate handler method inside controller classes
 * @param lambdaHandlerOptions Lambda handler options that will be applied to this handler
 * @returns The lambda handler decorator
 */
export function LambdaHandler<T, A extends [any, ...undefined[]], R extends Promise<any>>(
  lambdaHandlerOptions: Partial<AHLambdaHandlerConfig<any, any>> = {},
) {

  return (target: (this: T, ...args: A) => R, context: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>) => {
    if (!lambdaHandlerOptions.name) {
      lambdaHandlerOptions.name = String(context.name);
    }

    const controllerNamePromise = new Promise<any>((resolve) => {
      context.addInitializer(function () {
        if (typeof this === "object") {
          // Instance method
          return resolve(this.constructor.name);
        }

        // static method
        return resolve((this as any).name);
      });
    });

    const _lambdaHandlerOptions: AHLambdaHandlerConfig<any, any> = {
      controllerName: controllerNamePromise,
      name: lambdaHandlerOptions.name,
      callable: target as any,
      ...lambdaHandlerOptions,
    };

    const lambdaHandler = new AHLambdaHandler(_lambdaHandlerOptions);
    Anthill.getInstance()._registerHandler(lambdaHandler);
    return target;
  };
}
