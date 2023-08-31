import { AHAwsContext } from "../aws/aws-context";

export type AHCallable<T, U> = (event: T, context?: AHAwsContext) => Promise<U>;