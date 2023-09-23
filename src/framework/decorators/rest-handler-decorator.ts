import { AHRestHandler } from "../features/handler/rest-handler";
import { Anthill } from "../features/anthill";
import { AHException } from "../features/anthill-exception";
import { AHRestHandlerConfig } from "../models/handler/rest-handler-config";
// import { AHCallable } from "../models/handler/callable";
import { AHAwsEvent } from "../models/aws/event/aws-event";
import { AHHttpResponse } from "../features/http-response";


export function RestHandler <This, Args extends [AHAwsEvent, ...undefined[]], Return extends Promise<AHHttpResponse>>(restHandlerOptions: Partial<AHRestHandlerConfig>) {
  if (!restHandlerOptions.method) {
    throw new AHException("@RestHandler Missing rest handler method");
  }

  return (
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ) => {
      if (!restHandlerOptions.name) {
        restHandlerOptions.name = String(context.name);
      }

      // find a way to add an instance of the target's class to a Dependency Injection Container and then call the instance method of class method in the callable 
      // class DependencyContainer {
      //   private instances: Map<string, any> = new Map();
      
      //   // Register a class constructor with a unique identifier
      //   register<T>(identifier: string, constructor: new () => T) {
      //     this.instances.set(identifier, constructor);
      //   }
      
      //   // Resolve an instance by its identifier
      //   resolve<T>(identifier: string): T {
      //     const constructor = this.instances.get(identifier);
      
      //     if (!constructor) {
      //       throw new Error(`Dependency not registered: ${identifier}`);
      //     }
      
      //     return new constructor();
      //   }
      // }

      const _restHandlerOptions: AHRestHandlerConfig = {
        name: restHandlerOptions.name,
        method: restHandlerOptions.method,
        callable: target as any,
        ...restHandlerOptions,
      };
  
      const restHandler = new AHRestHandler(_restHandlerOptions);
      Anthill.getInstance()._registerHandler(restHandler);
      return target;
    }
}
