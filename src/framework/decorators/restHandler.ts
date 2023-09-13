import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerParams } from "../models/handler/rest-handler-params";


export function RestHandler(restHandlerOptions: Partial<AHRestHandlerParams>): MethodDecorator {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(propertyKey);
    }

    const _restHandlerOptions: AHRestHandlerParams = {
      name: restHandlerOptions.name,
      method: restHandlerOptions.method,
      callable: descriptor.value,
      ...restHandlerOptions,
    };

    const restHandler = new AHRestHandler(_restHandlerOptions);
    Anthill.getInstance().registerHandler(restHandler);

    return descriptor;
  };
}