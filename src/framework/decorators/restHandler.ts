import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";


export function RestHandler(restHandlerOptions: Partial<AHRestHandlerConfig>): MethodDecorator {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
    if (!restHandlerOptions.name) {
      restHandlerOptions.name = String(propertyKey);
    }

    const _restHandlerOptions: AHRestHandlerConfig = {
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