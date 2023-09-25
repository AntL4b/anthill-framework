import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHHttpResponse } from "../features/http-response";

export function RestHandler<T, A extends [AHAwsEvent, ...undefined[]], R extends Promise<AHHttpResponse>>(
  restHandlerOptions: Partial<AHRestHandlerConfig>,
) {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return (target: (this: T, ...args: A) => R, context: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>) => {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(context.name);
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

    const _restHandlerOptions: AHRestHandlerConfig = {
      controllerName: controllerNamePromise,
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: target as any,
      ...restHandlerOptions,
    };

    const restHandler = new AHRestHandler(_restHandlerOptions);
    Anthill.getInstance()._registerHandler(restHandler);
    return target;
  };
}
