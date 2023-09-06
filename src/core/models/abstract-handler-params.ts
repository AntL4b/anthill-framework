import { AHCallable } from "../../framework/models/handler/callable";
import { AHHandlerOptions } from "../../framework/models/handler/handler-options";


export interface AHAbstractHandlerParams<T, U>  {
  name: string;
  callable: AHCallable<T, U>;
  options?: AHHandlerOptions;
}
