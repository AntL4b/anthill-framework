import { AHRestHandlerOverridableConfig } from "../../framework/models/handler/rest-handler-overridable-config";
import { AHConstructible } from "./constructible";

export type AHRestControllerClass = AHConstructible<any> & {
  _restHandlerConfig: AHRestHandlerOverridableConfig;
}
