import { AwsCallback } from "../aws/aws-callback";
import { AwsContext } from "../aws/aws-context";

export type Callable<T, U> = (
  event: T,
  context?: AwsContext,
  callback?: AwsCallback,
) => Promise<U> | U;
