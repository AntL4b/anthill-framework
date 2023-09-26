import { AHAwsCallback } from "../aws/aws-callback";
import { AHAwsContext } from "../aws/aws-context";

export type AHCallable<T, U> = (
  event: T,
  context?: AHAwsContext,
  callback?: AHAwsCallback,
) => Promise<U> | U;
