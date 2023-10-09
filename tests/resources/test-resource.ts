import {
  HttpResponse,
  PromiseHelper,
  RestHandlerConfig,
  AwsEvent,
  RestMethodEnum,
  AwsContext,
  LambdaHandler,
  LambdaHandlerConfig,
  RestRequestHandler,
  LambdaRequestHandler,
} from "../../packages";

export class TestResource {
  static getBaseEvent(eventOverride?: Partial<AwsEvent>): AwsEvent {
    const baseEvent: AwsEvent = new AwsEvent();

    Object.assign(baseEvent, {
      ressource: "",
      path: "/",
      httpMethod: RestMethodEnum.Post,
      headers: { "Content-Type": "application/json" },
      requestContext: {
        ressourceId: "",
        resourcePath: "",
        httpMethod: RestMethodEnum.Post,
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

  static getBaseContext(contextOverride?: Partial<AwsContext>): AwsContext {
    const baseContext: AwsContext = new AwsContext();

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

  static getDefaultRestHandler(paramOverride?: Partial<RestHandlerConfig>): RestRequestHandler {
    const restHandler = new RestRequestHandler({
      ...{
        name: "handler",
        method: RestMethodEnum.Get,
        middlewares: [],
        callable: (event: AwsEvent, context: AwsContext) => PromiseHelper.promisify(HttpResponse.success(null)),
        cacheConfig: {
          cacheable: false,
        },
      },
      ...paramOverride,
    });

    restHandler.controllerName = "controller";

    return restHandler;
  }

  static getDefaultLambdaHandler(paramOverride?: Partial<LambdaHandlerConfig<any, any>>): LambdaRequestHandler<any, any> {
    const lambdaHandler =  new LambdaRequestHandler<any, any>({
      ...{
        name: "handler",
        callable: (event: any, context: AwsContext) => PromiseHelper.promisify(null),
      },
      ...paramOverride,
    });

    lambdaHandler.controllerName = "controller";

    return lambdaHandler;
  }
}
