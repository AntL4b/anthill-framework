import { RestRequestHandler } from "../features/handler/rest-request-handler";
import { Anthill } from "../features/anthill";
import { AnthillException } from "../features/anthill-exception";
import { RestHandlerConfig } from "../models/handler/rest-handler-config";
import { AwsEvent } from "../models/aws/event/aws-event";
import { HttpResponse } from "../features/http-response";
import { RestHandlerDecoratorConfig } from "../models/decorators/rest-handler-decorator-config";

/**
 * REST handler decorator used to decorate handler method inside controller classes
 * @param restHandlerOptions REST handler options that will be applied to this handler
 * @returns The REST handler decorator
 */
export function RestHandler<T, A extends [AwsEvent, ...undefined[]], R extends Promise<HttpResponse> | HttpResponse>(
  restHandlerOptions: RestHandlerDecoratorConfig,
) {
  if (!restHandlerOptions.method) {
    throw new AnthillException("@RestHandler Missing rest handler method");
  }

  return (target: (this: T, ...args: A) => R, context: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>) => {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(context.name);
    }

    const _restHandlerOptions: RestHandlerConfig = {
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: target as any,
      ...restHandlerOptions,
    };

    const restHandler = new RestRequestHandler(_restHandlerOptions);
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
