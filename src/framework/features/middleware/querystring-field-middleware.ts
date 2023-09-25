import { AHAwsEvent } from "../../models/aws/event/aws-event";
import { AHHttpResponse } from "../http-response";
import { AHPromiseHelper } from "../../helpers/promise-helper";
import { AHMiddleware } from "./middleware";
import { AHAwsContext } from "../../models/aws/aws-context";

export class AHQuerystringFieldMiddleware extends AHMiddleware<Array<string>> {
  constructor(payload: Array<string>) {
    super(payload);
  }

  override runBefore(event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
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
        return AHPromiseHelper.promisify(
          AHHttpResponse.error({ message: `[${notIncludedKeys.join(", ")}] not found in querystring` }),
        );
      } else {
        return AHPromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      // No query string parameters and required parameter(s)

      return AHPromiseHelper.promisify(
        AHHttpResponse.error({ message: `[${this.payload.join(", ")}] not found in querystring` }),
      );
    } else {
      // No query string parameters and no required parameter
      return AHPromiseHelper.promisify(event);
    }
  }
}
