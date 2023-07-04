import { AHHttpResponse, AHPromiseHelper, AHRestHandler } from "../..";
import { AHAwsEvent } from "../../framework/models/aws/event/aws-event";
import { AHRestMethodEnum } from "../../framework/models/enums/rest-method-enum";

export class AHTestResource {

  static getBaseEvent(eventOverride?: Partial<AHAwsEvent>): AHAwsEvent {
    const baseEvent: AHAwsEvent = new AHAwsEvent();

    Object.assign(baseEvent, {
      ressource: '',
      path: '/',
      httpMethod: AHRestMethodEnum.Post,
      headers: {},
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
      ...eventOverride
    });

    return baseEvent;
  }

  static getDefaultHandler(): AHRestHandler {
    return new AHRestHandler({
      name: "handler",
      method: AHRestMethodEnum.Get,
      middlewares: [],
      callable: (event: AHAwsEvent) => AHPromiseHelper.promisify(AHHttpResponse.success(null)),
      cacheConfig: {
        cachable: false
      },
    });
  }
}