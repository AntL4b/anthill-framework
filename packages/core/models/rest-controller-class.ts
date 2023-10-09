import { RestHandlerOverridableConfig } from "../../framework/models/handler/rest-handler-overridable-config";
import { Constructible } from "./constructible";

export type RestControllerClass = Constructible<any> & {
  _restHandlerConfig: RestHandlerOverridableConfig;
}
