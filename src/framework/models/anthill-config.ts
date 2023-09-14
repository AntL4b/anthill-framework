import { AHLambdaHandlerOverridableConfig } from "./handler/lambda-handler-overridable-config";
import { AHRestHandlerOverridableConfig } from "./handler/rest-handler-overridable-config";


export interface AHAnthillConfig {
  restHandlerConfig?: AHRestHandlerOverridableConfig;
  lambdaHandlerConfig?: AHLambdaHandlerOverridableConfig;
}
