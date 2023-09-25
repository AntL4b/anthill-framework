import { AHCallable } from "../framework/models/handler/callable";
import { AHException } from "../framework/features/anthill-exception";
import { AHAbstractHandlerConfig } from "./models/handler/abstract-handler-config";
import { AHAwsContext } from "../framework/models/aws/aws-context";
import { AHHandlerOptions } from "../framework/models/handler/handler-options";
import { AHTimeTracker } from "../framework/features/time-tracker";
import { AHMultiLevelHandlerConfig } from "./models/handler/multi-level-handler-config";
import { AHHandlerConfigLevelEnum } from "../framework/models/enums/handler-config-level-enum";
import { AHAwsCallback } from "../framework/models/aws/aws-callback";
import { AHPromiseHelper } from "../framework/helpers/promise-helper";
import { Anthill } from "../framework/features/anthill";

export abstract class AHAbstractHandler<T, U> {
  protected controllerName: Promise<string>;
  protected name: string;
  protected callable: AHCallable<T, U>;
  protected options: AHMultiLevelHandlerConfig<AHHandlerOptions> = {
    anthill: { displayPerformanceMetrics: false },
    controller: { displayPerformanceMetrics: false },
    handler: { displayPerformanceMetrics: false },
  };

  constructor(params: AHAbstractHandlerConfig<T, U>) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(
        `Invalid handler name: ${params.name}. Handler name must respect typescript var naming convention`,
      );
    }

    this.controllerName = params.controllerName;
    this.name = params.name;
    this.callable = params.callable;

    if (params.options) {
      this.setOptions(params.options, AHHandlerConfigLevelEnum.Handler);
    }
  }

  /**
   * Set new options for the handler
   * @param options The options to be set
   * @param configLevel The config level that should be applied for the given config
   */
  setOptions(
    options: AHHandlerOptions,
    configLevel: AHHandlerConfigLevelEnum = AHHandlerConfigLevelEnum.Handler,
  ): void {
    this.options[configLevel] = { ...this.options[configLevel], ...options };
  }

  /**
   * Get rest handler name
   * @returns The rest handler name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Display performance metrics for given tracker
   * @param tracker Tracker to print metrics for
   */
  displayPerformanceMetrics(tracker: AHTimeTracker) {
    if (this.computeOptions().displayPerformanceMetrics) {
      tracker.logTrackingSession();
    }
  }

  private computeOptions(): AHHandlerOptions {
    return {
      ...this.options.anthill,
      ...this.options.controller,
      ...this.options.handler,
    };
  }

  protected async getControllerInstance<T>(): Promise<T> {
    const controllerName = await AHPromiseHelper.timeout(
      this.controllerName,
      100,
      new AHException(
        `Can't resolve controller name for handler ${this.name}. A handler method must be inside a class decorated with a controller decorator`,
      ),
    );

    return Anthill.getInstance()._dependencyContainer.resolve<T>(controllerName);
  }

  /**
   * Handle the request
   * @param event The request event
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @param callback Callback method to respond the lambda call (pref not to use it)
   * @returns The request response
   */
  abstract handleRequest(event: T, context?: AHAwsContext, callback?: AHAwsCallback): Promise<U>;
}
