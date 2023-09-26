import {
  AHHttpResponse,
  AHPromiseHelper,
  AHRestHandler,
  AHRestHandlerConfig,
  AHAwsEvent,
  AHRestMethodEnum,
  AHAwsContext,
  AHLambdaHandler,
  AHLambdaHandlerConfig,
} from "../../packages";

export class AHTestResource {
  static getBaseEvent(eventOverride?: Partial<AHAwsEvent>): AHAwsEvent {
    const baseEvent: AHAwsEvent = new AHAwsEvent();

    Object.assign(baseEvent, {
      ressource: "",
      path: "/",
      httpMethod: AHRestMethodEnum.Post,
      headers: { "Content-Type": "application/json" },
      requestContext: {
        ressourceId: "",
        resourcePath: "",
        httpMethod: AHRestMethodEnum.Post,
        requestTime: "",
        path: "",
        accountId: "",
        protocol: "",
        domainPrefix: "",
        domainName: "",
        apiId: "",
        identity: {
          sourceIp: "",
          userAgent: "",
        },
      },
      isBase64Encoded: false,
      ...eventOverride,
    });

    return baseEvent;
  }

  static getBaseContext(contextOverride?: Partial<AHAwsContext>): AHAwsContext {
    const baseContext: AHAwsContext = new AHAwsContext();

    Object.assign(baseContext, {
      awsRequestId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      callbackWaitsForEmptyEventLoop: true,
      clientContext: null,
      functionName: "test",
      functionVersion: "$LATEST",
      identity: undefined,
      invokedFunctionArn: "test-invokedFunctionArn",
      logGroupName: "test-logGroupName",
      logStreamName: "test-logStreamName",
      memoryLimitInMB: "1024",
      getRemainingTimeInMillis: () => 1000000,
      ...contextOverride,
    });

    return baseContext;
  }

  static getDefaultRestHandler(paramOverride?: Partial<AHRestHandlerConfig>): AHRestHandler {
    const restHandler = new AHRestHandler({
      ...{
        name: "handler",
        method: AHRestMethodEnum.Get,
        middlewares: [],
        callable: (event: AHAwsEvent, context: AHAwsContext) => AHPromiseHelper.promisify(AHHttpResponse.success(null)),
        cacheConfig: {
          cachable: false,
        },
      },
      ...paramOverride,
    });

    restHandler.controllerName = "controller";

    return restHandler;
  }

  static getDefaultLambdaHandler(paramOverride?: Partial<AHLambdaHandlerConfig<any, any>>): AHLambdaHandler<any, any> {
    const lambdaHandler =  new AHLambdaHandler<any, any>({
      ...{
        name: "handler",
        callable: (event: any, context: AHAwsContext) => AHPromiseHelper.promisify(null),
      },
      ...paramOverride,
    });

    lambdaHandler.controllerName = "controller";

    return lambdaHandler;
  }
}
