import { Callable } from "../../framework/models/handler/callable";

export interface AbstractHandlerConfig<T, U> {
  name: string;
  callable: Callable<T, U>;
}
