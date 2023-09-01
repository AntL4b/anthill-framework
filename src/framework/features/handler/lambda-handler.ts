import { AHLogger } from "../logger";
import { AHTimeTracker } from "../time-tracker";
import { AHAbstractHandler } from "../../../core/abstract-handler";
import { AHAwsContext } from "../../models/aws/aws-context";
import { AHLambdaHandlerParams } from "../../models/handler/lambda-handler-params";


export class AHLambdaHandler<T, U> extends AHAbstractHandler<T, U> {

  constructor(params: AHLambdaHandlerParams<T, U>) {
    super(params);
  }

  /**
   * Handle the request
   * Run the handler callable function
   * @param event The event to be passed through the callable function
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @returns A response
   */
  async handleRequest(event: T, context?: AHAwsContext): Promise<U> {
    const tracker: AHTimeTracker = new AHTimeTracker();

    try {
      tracker.startTrackingSession(this.name + "-tracking-session");

      AHLogger.getInstance().debug("Handling request");
      AHLogger.getInstance().debug(`Name: ${this.name}`);

      // Now run the handler callable function
      AHLogger.getInstance().debug("Running handler callable");

      tracker.startSegment("callable-run");
      const callableReponse = await this.callable(event, context);
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
