import { AHLogger } from "../logger";
import { AHTimeTracker } from "../time-tracker";
import { AHAbstractHandler } from "../../../core/abstract-handler";
import { AHAwsContext } from "../../models/aws/aws-context";
import { AHLambdaHandlerConfig } from "../../models/handler/lambda-handler-config";
import { Anthill } from "../anthill";


export class AHLambdaHandler<T, U> extends AHAbstractHandler<T, U> {

  constructor(params: AHLambdaHandlerConfig<T, U>) {
    // Apply lambdaHandlerConfig options
    params.options = { ...Anthill.getInstance()._configuration.lambdaHandlerConfig.options, ...params.options };
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
  async handleRequest(event: T, context?: AHAwsContext, callback?: (...args: Array<any>) => any): Promise<U> {
    const tracker: AHTimeTracker = new AHTimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      AHLogger.getInstance().debug("Handling request");
      AHLogger.getInstance().debug(`Name: ${this.name}`);

      // Now run the handler callable function
      AHLogger.getInstance().debug("Running handler callable");

      tracker.startSegment("callable-run");
      const callableReponse = await this.callable(event, context, callback);
      tracker.stopSegment("callable-run");

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);
      return callableReponse;
    } catch (e) {
      AHLogger.getInstance().error((e as { message: string }).message);

      tracker.stopTrackingSession();
      this.displayPerformanceMetrics(tracker);

      return null;
    }
  }
}
