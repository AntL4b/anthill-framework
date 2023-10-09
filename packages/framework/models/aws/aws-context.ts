export class AwsContext {
  getRemainingTimeInMillis: () => number;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  clientContext: any;
  identity: any;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  callbackWaitsForEmptyEventLoop: boolean;
}
