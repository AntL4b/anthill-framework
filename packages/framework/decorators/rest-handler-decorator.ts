import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHHttpResponse } from "../features/http-response";
import { AHRestHandlerDecoratorConfig } from "../models/decorators/rest-handler-decorator-config";

/**
 * REST handler decorator used to decorate handler method inside controller classes
 * @param restHandlerOptions REST handler options that will be applied to this handler
 * @returns The REST handler decorator
 */
export function RestHandler<T, A extends [AHAwsEvent, ...undefined[]], R extends Promise<AHHttpResponse> | AHHttpResponse>(
  restHandlerOptions: AHRestHandlerDecoratorConfig,
) {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return (target: (this: T, ...args: A) => R, context: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>) => {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(context.name);
    }

    const _restHandlerOptions: AHRestHandlerConfig = {
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: target as any,
      ...restHandlerOptions,
    };

    const restHandler = new AHRestHandler(_restHandlerOptions);
    Anthill.getInstance()._registerHandler(restHandler);

    context.addInitializer(function () {
      if (typeof this === "object") {
        // Instance method
        restHandler.controllerName = this.constructor.name;
      } else {
        // static method
        restHandler.controllerName = (this as any).name;
      }
    });

    return target;
  };
}
