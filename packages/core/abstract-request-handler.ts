import { Callable } from "../framework/models/handler/callable";
import { AnthillException } from "../framework/features/anthill-exception";
import { AbstractHandlerConfig } from "./models/abstract-handler-config";
import { AwsContext } from "../framework/models/aws/aws-context";
import { TimeTracker } from "../framework/features/time-tracker";
import { AwsCallback } from "../framework/models/aws/aws-callback";
import { Anthill } from "../framework/features/anthill";

export abstract class AbstractRequestHandler<T, U> {
  public controllerName: string;
  protected name: string;
  protected callable: Callable<T, U>;

  constructor(params: AbstractHandlerConfig<T, U>) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AnthillException(
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
  displayPerformanceMetrics(tracker: TimeTracker) {
    if (Anthill.getInstance()._configuration.options.displayPerformanceMetrics) {
      tracker.logTrackingSession();
    }
  }

  protected getControllerInstance<T>(): T {
    if (!this.controllerName) {
      throw new AnthillException(
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
  abstract handleRequest(event: T, context?: AwsContext, callback?: AwsCallback): Promise<U>;
}
