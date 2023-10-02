import { AHAwsEventRequestContext } from "./aws-event-request-context";
import { AHRestMethodEnum } from "../../enums/rest-method-enum";

export class AHAwsEvent {
  ressource: string;
  path: string;
  methodArn: string;
  httpMethod: AHRestMethodEnum;
  headers: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  stageVariables?: { [key: string]: string };
  requestContext: AHAwsEventRequestContext;
  body?: string | any; // Might be altered by middlewares
  isBase64Encoded: boolean;
  middlewareData?: any;
}
