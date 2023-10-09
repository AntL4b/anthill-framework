import { AwsEventRequestContext } from "./aws-event-request-context";
import { RestMethodEnum } from "../../enums/rest-method-enum";

export class AwsEvent {
  ressource: string;
  path: string;
  methodArn: string;
  httpMethod: RestMethodEnum;
  headers: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  stageVariables?: { [key: string]: string };
  requestContext: AwsEventRequestContext;
  body?: string | any; // Might be altered by middlewares
  isBase64Encoded: boolean;
  middlewareData?: any;
}
