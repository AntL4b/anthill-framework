import { AHAwsEvent } from '../../models/aws/event/aws-event';
import { AHHttpResponse } from '../../models/http/http-response';
import { AHPromiseHelper } from '../helpers/promise-helper';
import { AHAbstractMiddleware } from './abstract-middleware';

export class AHQueryStringCheckerMiddleware extends AHAbstractMiddleware {
  constructor(payload: Array<string>) {
    super(payload);
  }

  run(event: AHAwsEvent): Promise<AHAwsEvent | AHHttpResponse> {
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
          AHHttpResponse.error({ message: '[' + notIncludedKeys.join(', ') + '] not found in query string' }),
        );
      } else {
        return AHPromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      // No query string parameters and required parameter(s)

      return AHPromiseHelper.promisify(
        AHHttpResponse.error({ message: '[' + this.payload.join(', ') + '] not found in query string' }),
      );
    } else {
      // No query string parameters and no required parameter
      return AHPromiseHelper.promisify(event);
    }
  }
}
