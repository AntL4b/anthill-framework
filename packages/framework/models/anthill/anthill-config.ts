import { AnthillOptions } from "./anthill-options";
import { LambdaHandlerOverridableConfig } from "../handler/lambda-handler-overridable-config";
import { RestHandlerOverridableConfig } from "../handler/rest-handler-overridable-config";

export interface AnthillConfig {
  controllers?: Array<any>
  restHandlerConfig?: RestHandlerOverridableConfig;
  lambdaHandlerConfig?: LambdaHandlerOverridableConfig;
  options?: AnthillOptions;
}
