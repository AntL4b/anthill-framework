import { AHHttpResponse, AHPromiseHelper, AHRestHandler, AHRestHandlerParams } from "../..";
import { AHAwsEvent } from "../..";
import { AHRestMethodEnum } from "../..";

export class AHTestResource {

  static getBaseEvent(eventOverride?: Partial<AHAwsEvent>): AHAwsEvent {
    const baseEvent: AHAwsEvent = new AHAwsEvent();

    Object.assign(baseEvent, {
      ressource: '',
      path: '/',
      httpMethod: AHRestMethodEnum.Post,
      headers: { "Content-Type": "application/json"},
      requestContext: {
        ressourceId: '',
        resourcePath: '',
        httpMethod: AHRestMethodEnum.Post,
        requestTime: '',
        path: '',
        accountId: '',
        protocol: '',
        domainPrefix: '',
        domainName: '',
        apiId: '',
        identity: {
          sourceIp: '',
          userAgent: '',
        },
      },
      isBase64Encoded: false,
      ...eventOverride
    });

    return baseEvent;
  }

  static getDefaultHandler(paramOverride?: Partial<AHRestHandlerParams>): AHRestHandler {
    return new AHRestHandler({
      ...{
        name: "handler",
        method: AHRestMethodEnum.Get,
        middlewares: [],
        callable: (event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)),
        cacheConfig: {
          cachable: false
        },
      },
      ...paramOverride
    });
  }
}