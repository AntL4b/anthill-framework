import { LambdaHandlerOverridableConfig } from "../../framework/models/handler/lambda-handler-overridable-config";
import { Constructible } from "./constructible";

export type LambdaControllerClass = Constructible<any> & {
  _lambdaHandlerConfig: LambdaHandlerOverridableConfig;
};