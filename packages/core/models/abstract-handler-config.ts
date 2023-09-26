import { AHCallable } from "../../framework/models/handler/callable";

export interface AHAbstractHandlerConfig<T, U> {
  name: string;
  callable: AHCallable<T, U>;
}
