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
}