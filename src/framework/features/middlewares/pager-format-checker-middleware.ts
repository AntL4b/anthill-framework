import { AHAwsEvent } from '../../models/aws/event/aws-event';
import { AHHttpResponse } from '../../models/http/http-response';
import { AHPromiseHelper } from '../../helpers/promise-helper';
import { AHAbstractMiddleware } from './abstract-middleware';
import { AHAwsContext } from '../../models/aws/aws-context';


export class AHPagerFormatCheckerMiddleware extends AHAbstractMiddleware<void> {
  constructor() {
    super();
  }

  async run(event: AHAwsEvent, context?: AHAwsContext): Promise<AHAwsEvent | AHHttpResponse> {
    let page = event.queryStringParameters?.page ? parseInt(event.queryStringParameters?.page) : null;
    const pageSize = event.queryStringParameters?.pageSize ? parseInt(event.queryStringParameters?.pageSize) : null;

    if (pageSize && !page) {
      event.queryStringParameters.page = "1";
      page = 1;
    }

    if (page < 0 || pageSize < 0) {
      return AHPromiseHelper.promisify(
        AHHttpResponse.error({
          message: `Invalid pager values received (${event.queryStringParameters?.page}, ${event.queryStringParameters?.pageSize})`,
        }),
      );
    } else {
      return AHPromiseHelper.promisify(event);
    }
  }
}
