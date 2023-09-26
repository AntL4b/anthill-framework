import { AHCallable } from "../framework/models/handler/callable";
import { AHException } from "../framework/features/anthill-exception";
import { AHAbstractHandlerConfig } from "./models/abstract-handler-config";
import { AHAwsContext } from "../framework/models/aws/aws-context";
import { AHTimeTracker } from "../framework/features/time-tracker";
import { AHAwsCallback } from "../framework/models/aws/aws-callback";
import { Anthill } from "../framework/features/anthill";

export abstract class AHAbstractHandler<T, U> {
  public controllerName: string;
  protected name: string;
  protected callable: AHCallable<T, U>;

  constructor(params: AHAbstractHandlerConfig<T, U>) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(
        `Invalid handler name: ${params.name}. Handler name must respect typescript var naming convention`,
      );
    }

    this.controllerName = null;
    this.name = params.name;
    this.callable = params.callable;
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
    if (Anthill.getInstance()._configuration.options.displayPerformanceMetrics) {
      tracker.logTrackingSession();
    }
  }

  protected getControllerInstance<T>(): T {
    if (!this.controllerName) {
      throw new AHException(
        `Can't resolve controller name for handler ${this.name}. A handler method must be inside a class decorated with a controller decorator`,
      );
    }

    return Anthill.getInstance()._dependencyContainer.resolve<T>(this.controllerName);
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
