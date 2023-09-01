import { AHAwsContext, AHException } from '..';
import { AHLambdaHandler } from '../framework/features/handler/lambda-handler';
import { AHTestResource } from './resources/test-resource';

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

describe('AHLambdaHandler', () => {
  beforeEach(() => {
    AHLambdaHandler.setDefaultOptions({
      displayPerformanceMetrics: false,
    });
  });

  test('constructor', () => {
    let handler = AHTestResource.getDefaultLambdaHandler();
    expect(handler).toBeInstanceOf(AHLambdaHandler);
  });

  test('handleRequest', async () => {
    const handler = AHTestResource.getDefaultLambdaHandler();
    const response = await handler.handleRequest(null, AHTestResource.getBaseContext());

    expect(response).toBe(null);
  });

  test('handleRequest with exception', async () => {
    const handler = AHTestResource.getDefaultLambdaHandler({
      callable: (event: any, context: AHAwsContext) => { throw new AHException('error')}
    });
    
    const response = await handler.handleRequest(null, AHTestResource.getBaseContext());

    expect(response).toBe(null);
  });
});
