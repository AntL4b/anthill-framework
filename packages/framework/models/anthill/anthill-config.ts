import { AHAnthillOptions } from "./anthill-options";
import { AHLambdaHandlerOverridableConfig } from "../handler/lambda-handler-overridable-config";
import { AHRestHandlerOverridableConfig } from "../handler/rest-handler-overridable-config";

export interface AHAnthillConfig {
  controllers?: Array<any>
  restHandlerConfig?: AHRestHandlerOverridableConfig;
  lambdaHandlerConfig?: AHLambdaHandlerOverridableConfig;
  options?: AHAnthillOptions;
}
