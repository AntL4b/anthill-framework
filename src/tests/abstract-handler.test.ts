import { AHAwsContext, AHException, AHLogger, AHHandlerOptions } from '..';
import { AHPromiseHelper } from '..';
import { AHLambdaHandler } from '../framework/features/handler/lambda-handler';
import { AHTestResource } from './resources/test-resource';

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

describe('AHAbstractHandler', () => {
  beforeEach(() => {
    AHLambdaHandler.setDefaultOptions({
      displayPerformanceMetrics: false,
    });
  });

  test('constructor', () => {
    expect(() => {
      new AHLambdaHandler<any, any>({
        name: 'invalid-name',
        callable: (event: any, context: AHAwsContext) => AHPromiseHelper.promisify(null),
      });
    }).toThrow(AHException);
  });

  test('setDefaultOptions', () => {
    const newDefaultOptions: AHHandlerOptions = {
      displayPerformanceMetrics: true,
    };

    AHLambdaHandler.setDefaultOptions(newDefaultOptions);

    expect(JSON.stringify(AHLambdaHandler['defaultOptions'])).toBe(JSON.stringify(newDefaultOptions));
  });

  test('setOptions', () => {
    const newOptions: AHHandlerOptions = {
      displayPerformanceMetrics: true,
    };

    const handler = AHTestResource.getDefaultLambdaHandler();
    handler.setOptions(newOptions);

    expect(JSON.stringify(handler['options'])).toBe(JSON.stringify(newOptions));
  });

  test('getName', () => {
    const handler = AHTestResource.getDefaultRestHandler();
    expect(handler.getName()).toBe('handler');
  });

  test('displayPerformanceMetrics', async () => {
    const logger = AHLogger.getInstance();
    const logHandler = jest.fn(() => {});
    logger.addHandler(logHandler);

    const handler = AHTestResource.getDefaultLambdaHandler({
      options: {
        displayPerformanceMetrics: true,
      },
    });
    await handler.handleRequest(null, AHTestResource.getBaseContext());
    expect(logHandler).toHaveBeenCalled();
  });
});
