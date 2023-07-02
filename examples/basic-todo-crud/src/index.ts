import { AHAwsEvent, AHEnvEnum, AHEnvironmentHelper, AHLogLevelEnum, AHLogger } from "@antl4b/anthill-framework";
import { AHTodoHandlers } from "./handlers/todo-handlers";

AHLogger.getInstance().setLogLevel(AHLogLevelEnum.Debug);

if (AHEnvironmentHelper.getEnv() === AHEnvEnum.Prod) {
  AHLogger.getInstance().setLogLevel(AHLogLevelEnum.Info);
}

exports.listTodo = async (event: AHAwsEvent) => {
  return await AHTodoHandlers.listTodo.handleRequest(event);
};