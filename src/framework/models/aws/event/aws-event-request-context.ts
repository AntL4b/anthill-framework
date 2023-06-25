import { AHAwsEventRequestContextIdentity } from './aws-event-request-context-identity';
import { AHRestMethodEnum } from '../../enums/rest-method-enum';

export interface AHAwsEventRequestContext {
  ressourceId: string;
  resourcePath: string;
  httpMethod: AHRestMethodEnum;
  requestTime: string;
  path: string;
  accountId: string;
  protocol: string;
  stage?: string;
  domainPrefix: string;
  domainName: string;
  apiId: string;
  identity: AHAwsEventRequestContextIdentity;
  authorizer?: { [key: string]: any };
}
