import { AwsEventRequestContextIdentity } from "./aws-event-request-context-identity";
import { RestMethodEnum } from "../../enums/rest-method-enum";

export interface AwsEventRequestContext {
  ressourceId: string;
  resourcePath: string;
  httpMethod: RestMethodEnum;
  requestTime: string;
  path: string;
  accountId: string;
  protocol: string;
  stage?: string;
  domainPrefix: string;
  domainName: string;
  apiId: string;
  identity: AwsEventRequestContextIdentity;
  authorizer?: { [key: string]: any };
}
