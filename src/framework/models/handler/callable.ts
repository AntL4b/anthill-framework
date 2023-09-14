import { AHAwsContext } from "../aws/aws-context";

export type AHCallable<T, U> = (event: T, context?: AHAwsContext, callback?: (...args: Array<any>) => any) => Promise<U>;