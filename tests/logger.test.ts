import { Logger, logDebug, logError, logInfo, logWarn, EnvEnum, LogLevelEnum, logTrace } from "../packages";

describe("Logger", () => {
  beforeEach(() => {
    Logger["instance"] = null;
  });

  test("constructor / getInstance", () => {
    process.env.ENV = EnvEnum.Dev;

    // Use object property notation to affect private member instance
    Logger["instance"] = null;

    // Instanciate in dev env
    expect(Logger.getInstance()).toBeInstanceOf(Logger);

    process.env.ENV = EnvEnum.Prod;
    Logger["instance"] = null;

    // Re-instanciate in prod env
    expect(Logger.getInstance()).toBeInstanceOf(Logger);
  });

  test("Log all level", () => {
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevelEnum.Trace);

    expect(logger.trace("trace test")).toBeUndefined();
    expect(logger.debug("debug test")).toBeUndefined();
    expect(logger.info("info test")).toBeUndefined();
    expect(logger.warn("warn test")).toBeUndefined();
    expect(logger.error("error test")).toBeUndefined();
  });

  test("Log all level alias method", () => {
    expect(logTrace("trace test")).toBeUndefined();
    expect(logDebug("debug test")).toBeUndefined();
    expect(logInfo("info test")).toBeUndefined();
    expect(logWarn("warn test")).toBeUndefined();
    expect(logError("error test")).toBeUndefined();
  });

  test("setformatter", () => {
    const logger = Logger.getInstance();
    const formatter = jest.fn(() => "string");
    logger.setformatter(formatter);
    logger.setLogLevel(LogLevelEnum.Debug);

    expect(formatter).toHaveBeenCalledTimes(0);
    logger.info("info test");
    expect(formatter).toHaveBeenCalledTimes(1);

    logger.info("info test", { obj: true });
    expect(formatter).toHaveBeenCalledTimes(3);
  });

  test("addHandler", () => {
    const logger = Logger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    expect(handler).toHaveBeenCalledTimes(0);
    logger.info("info test");
    expect(handler).toHaveBeenCalledTimes(1);

    logger.info("info test", { obj: true });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("removeAllHandlers", () => {
    const logger = Logger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    logger.removeAllHandlers();

    expect(handler).toHaveBeenCalledTimes(0);
    logger.info("info test");
    expect(handler).toHaveBeenCalledTimes(0);

    logger.info("info test", { obj: true });
    expect(handler).toHaveBeenCalledTimes(0);
  });

  test("setLogLevel", () => {
    const logger = Logger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);
    logger.setLogLevel(LogLevelEnum.Error);

    logger.trace("trace test");
    logger.debug("debug test");
    logger.info("info test");
    logger.warn("warn test");
    logger.error("error test");

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
