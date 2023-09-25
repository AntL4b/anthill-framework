import { AHRestHandlerOverridableConfig } from "../../../framework/models/handler/rest-handler-overridable-config";
import { AHConstructible } from "../constructible";

export type AHRestControllerClass<T> = AHConstructible<T> & {
  _restHandlerConfig: AHRestHandlerOverridableConfig;
}
