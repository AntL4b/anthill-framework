import { AHAwsEvent } from '../../models/aws/event/aws-event';
import { AHHttpResponse } from '../../models/http/http-response';
import { AHPromiseHelper } from '../../helpers/promise-helper';
import { AHAbstractMiddleware } from './abstract-middleware';


export class AHBodyCheckerMiddleware extends AHAbstractMiddleware {
  constructor(payload: Array<string>) {
    super(payload);
  }

  run(event: AHAwsEvent): Promise<AHAwsEvent | AHHttpResponse> {
    if (event.body) {
      const body = JSON.parse(event.body);
      let notIncludedKeys: Array<string> = [];

      this.payload.map((p: string) => {
        const splittedKey = p.split('.');
        let remainingBodyPart = body;

        if (splittedKey.length > 1) {
          for (let i = 0; i < splittedKey.length; i++) {
            if (!remainingBodyPart[splittedKey[i]]) {
              notIncludedKeys.push(p);
              break;
            }

            remainingBodyPart = remainingBodyPart[splittedKey[i]];
          }
        } else if (!body.hasOwnProperty(p)) {
          notIncludedKeys.push(p);
        }
      });

      if (notIncludedKeys.length > 0) {
        return AHPromiseHelper.promisify(
          AHHttpResponse.error({ message: '[' + notIncludedKeys.join(', ') + '] not found in body' }),
        );
      } else {
        return AHPromiseHelper.promisify(event);
      }
    } else if (this.payload.length) {
      return AHPromiseHelper.promisify(
        AHHttpResponse.error({ message: '[' + this.payload.join(', ') + '] not found in body' }),
      );
    } else {
      return AHPromiseHelper.promisify(event);
    }
  }
}
