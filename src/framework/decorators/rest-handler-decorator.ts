import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";
import { AHCallable } from "../models/handler/callable";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHHttpResponse } from "../features/http-response";


export function RestHandler(restHandlerOptions: Partial<AHRestHandlerConfig>): any {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return (target: AHCallable<AHAwsEvent, AHHttpResponse>, context: ClassMethodDecoratorContext): any => {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(context.name);
    }

    const _restHandlerOptions: AHRestHandlerConfig = {
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: target,
      ...restHandlerOptions,
    };

    const restHandler = new AHRestHandler(_restHandlerOptions);
    Anthill.getInstance()._registerHandler(restHandler);
  };
}
