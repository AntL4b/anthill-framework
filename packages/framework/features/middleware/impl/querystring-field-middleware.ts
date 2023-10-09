import { AwsEvent } from "../../../models/aws/event/aws-event";
import { HttpResponse } from "../../http-response";
import { PromiseHelper } from "../../../helpers/promise-helper";
import { Middleware } from "../middleware";
import { AwsContext } from "../../../models/aws/aws-context";

export class QuerystringFieldMiddleware extends Middleware<Array<string>> {
  constructor(payload: Array<string>) {
    super(payload);
  }

  override runBefore(event: AwsEvent, context?: AwsContext): Promise<AwsEvent | HttpResponse> {
    if (event.queryStringParameters) {
      const queryStringParametersKeys = Object.keys(event.queryStringParameters);

      let notIncludedKeys: Array<string> = [];

      if (this.payload.length > 0) {
        this.payload.map((p: string) => {
          if (!queryStringParametersKeys.includes(p)) {
            notIncludedKeys.push(p);
          }
        });
      }

      if (notIncludedKeys.length > 0) {
        return PromiseHelper.promisify(
          HttpResponse.error({ message: `[${notIncludedKeys.join(", ")}] not found in querystring` }),
        );
      } else {
        return PromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      // No query string parameters and required parameter(s)

      return PromiseHelper.promisify(
        HttpResponse.error({ message: `[${this.payload.join(", ")}] not found in querystring` }),
      );
    } else {
      // No query string parameters and no required parameter
      return PromiseHelper.promisify(event);
    }
  }
}
