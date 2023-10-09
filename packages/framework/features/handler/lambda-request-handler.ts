import { Logger } from "../logger";
import { TimeTracker } from "../time-tracker";
import { AbstractRequestHandler } from "../../../core/abstract-request-handler";
import { AwsContext } from "../../models/aws/aws-context";
import { LambdaHandlerConfig } from "../../models/handler/lambda-handler-config";
import { AwsCallback } from "../../models/aws/aws-callback";

export class LambdaRequestHandler<T, U> extends AbstractRequestHandler<T, U> {
  constructor(params: LambdaHandlerConfig<T, U>) {
    // Apply lambdaHandlerConfig options
    super(params);
  }

  /**
   * Handle the request
   * Run the handler callable function
   * @param event The event to be passed through the callable function
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @param callback Callback method to respond the lambda call (pref not to use it)
   * @returns A response
   */
  async handleRequest(event: T, context?: AwsContext, callback?: AwsCallback): Promise<U> {
    const tracker: TimeTracker = new TimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      Logger.getInstance().debug("Handling request");
      Logger.getInstance().debug(`Name: ${this.name}`);

      // Now run the handler callable function
      Logger.getInstance().debug("Running handler callable");

      tracker.startSegment("callable-run");
      const controllerInstance = await this.getControllerInstance();
      const callableReponse = await this.callable.call(controllerInstance, ...[event, context, callback]);
      tracker.stopSegment("callable-run");

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);
      return callableReponse;
    } catch (e) {
      Logger.getInstance().error((e as { message: string }).message);

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);

      throw e;
    }
  }
}
