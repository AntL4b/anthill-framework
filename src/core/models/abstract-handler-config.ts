import { AHCallable } from "../../framework/models/handler/callable";
import { AHHandlerOptions } from "../../framework/models/handler/handler-options";


export interface AHAbstractHandlerConfig<T, U>  {
  name: string;
  callable: AHCallable<T, U>;
  options?: AHHandlerOptions;
}
