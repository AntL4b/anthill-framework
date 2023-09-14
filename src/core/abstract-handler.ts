import { AHCallable } from "../framework/models/handler/callable";
import { AHException } from "../framework/features/anthill-exception";
import { AHAbstractHandlerConfig } from "./models/abstract-handler-config";
import { AHAwsContext } from "../framework/models/aws/aws-context";
import { AHHandlerOptions } from "../framework/models/handler/handler-options";
import { AHTimeTracker } from "../framework/features/time-tracker";

export abstract class AHAbstractHandler<T, U> {

  protected name: string;
  protected callable: AHCallable<T, U>;
  protected options: AHHandlerOptions = { displayPerformanceMetrics: false, };

  constructor(params: AHAbstractHandlerConfig<T, U>) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(
        `Invalid handler name: ${params.name}. Handler name must respect typescript var naming convention`,
      );
    }

    this.name = params.name;
    this.callable = params.callable;

    if (params.options) {
      this.options = { ...this.options, ...params.options };
    }
  }

  /**
   * Set new options for the handler
   * @param options The options to be set
   */
  setOptions(options: AHHandlerOptions): void {
    this.options = { ...this.options, ...options };
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
    if (this.options.displayPerformanceMetrics) {
      tracker.logTrackingSession();
    }
  }

  /**
   * Handle the request
   * @param event The request event
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @returns The request response
   */
  abstract handleRequest(event: T, context?: AHAwsContext): Promise<U>;
}
