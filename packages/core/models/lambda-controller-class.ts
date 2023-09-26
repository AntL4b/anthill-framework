import { AHLambdaHandlerOverridableConfig } from "../../framework/models/handler/lambda-handler-overridable-config";
import { AHConstructible } from "./constructible";

export type AHLambdaControllerClass = AHConstructible<any> & {
  _lambdaHandlerConfig: AHLambdaHandlerOverridableConfig;
};