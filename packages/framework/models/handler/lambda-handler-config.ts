import { AbstractHandlerConfig } from "../../../core/models/abstract-handler-config";

export interface LambdaHandlerConfig<T, U> extends AbstractHandlerConfig<T, U> {
  /* no more config than what is in the extended class for the moment */
}
