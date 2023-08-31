import { AHCallable } from "../framework/models/handler/callable";
import { AHException } from "../framework/features/anthill-exception";
import { AHAbstractHandlerParams } from "./models/abstract-handler-params";
import { AHAwsContext } from "../framework/models/aws/aws-context";


export abstract class AHAbstractHandler<T, U> {

  protected name: string;
  protected callable: AHCallable<T, U>;

  constructor(params: AHAbstractHandlerParams<T, U>) {
    if (!/^[a-zA-z_]+[a-zA-z0-9]*$/.test(params.name)) {
      throw new AHException(`Invalid handler name: ${params.name}. Handler name must respect typescript var naming convention`);
    }

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
   * Handle the request
   * @param event The request event
   * @param context This object provides methods and properties that provide information about the invocation, function, and execution environment
   * @returns The request response
   */
  abstract handleRequest(event: T, context?: AHAwsContext): Promise<U>;
}
