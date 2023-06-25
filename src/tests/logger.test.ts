import { AHLogger } from "../framework/logger";
import { AHEnvEnum } from "../framework/models/enums/env-enum";
import { AHLogLevelEnum } from "../framework/models/enums/log-level-enum";

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};
global.console.warn = (message: string) => {
  console.log(`warn: ${message}`);
};

describe('AHLogger', () => {
  test('constructor / getInstance', () => {
    process.env.ENV = AHEnvEnum.Dev;

    // Use object property notation to affect private member instance
    AHLogger['instance'] = null;

    // Instanciate in dev env
    expect(AHLogger.getInstance()).toBeInstanceOf(AHLogger);

    process.env.ENV = AHEnvEnum.Prod;
    AHLogger['instance'] = null;

    // Instanciate in prod env
    expect(AHLogger.getInstance()).toBeInstanceOf(AHLogger);
  });

  test('Log all level', () => {
    const logger = AHLogger.getInstance();

    expect(logger.debug('debug test')).toBeUndefined();
    expect(logger.info('info test')).toBeUndefined();
    expect(logger.warn('warn test')).toBeUndefined();
    expect(logger.error('error test')).toBeUndefined();
  });

  test('setformatter', () => {
    const logger = AHLogger.getInstance();
    logger.setLogLevel(AHLogLevelEnum.Debug);

    const formatter = jest.fn(() => 'string');
    logger.setformatter(formatter);

    expect(formatter).toHaveBeenCalledTimes(0);

    logger.info('info test');

    expect(formatter).toHaveBeenCalledTimes(1);
  });

  test('addHandler', () => {
    const logger = AHLogger.getInstance();

    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    expect(handler).toHaveBeenCalledTimes(0);

    logger.info('info test');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('setLogLevel', () => {
    const logger = AHLogger.getInstance();

    logger.setLogLevel(AHLogLevelEnum.Error);

    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    logger.debug('debug test');
    logger.info('info test');
    logger.warn('warn test');
    logger.error('error test');

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
