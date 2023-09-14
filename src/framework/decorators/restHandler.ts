import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";
import { AHAwsEvent, AHCallable, AHHttpResponse } from "../..";


export function RestHandler(restHandlerOptions: Partial<AHRestHandlerConfig>): any {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return function (originalMethod: AHCallable<AHAwsEvent, AHHttpResponse>, context: ClassMethodDecoratorContext): any {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(context.name);
    }

    const _restHandlerOptions: AHRestHandlerConfig = {
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: originalMethod,
      ...restHandlerOptions,
    };

    const restHandler = new AHRestHandler(_restHandlerOptions);
    Anthill.getInstance()._registerHandler(restHandler);
  }
}