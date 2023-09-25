import { AHLogger, logDebug, logError, logInfo, logWarn, AHEnvEnum, AHLogLevelEnum } from "../packages";

describe("AHLogger", () => {
  beforeEach(() => {
    AHLogger["instance"] = null;
  });

  test("constructor / getInstance", () => {
    process.env.ENV = AHEnvEnum.Dev;

    // Use object property notation to affect private member instance
    AHLogger["instance"] = null;

    // Instanciate in dev env
    expect(AHLogger.getInstance()).toBeInstanceOf(AHLogger);

    process.env.ENV = AHEnvEnum.Prod;
    AHLogger["instance"] = null;

    // Re-instanciate in prod env
    expect(AHLogger.getInstance()).toBeInstanceOf(AHLogger);
  });

  test("Log all level", () => {
    const logger = AHLogger.getInstance();

    expect(logger.debug("debug test")).toBeUndefined();
    expect(logger.info("info test")).toBeUndefined();
    expect(logger.warn("warn test")).toBeUndefined();
    expect(logger.error("error test")).toBeUndefined();
  });

  test("Log all level alias method", () => {
    expect(logDebug("debug test")).toBeUndefined();
    expect(logInfo("info test")).toBeUndefined();
    expect(logWarn("warn test")).toBeUndefined();
    expect(logError("error test")).toBeUndefined();
  });

  test("setformatter", () => {
    const logger = AHLogger.getInstance();
    const formatter = jest.fn(() => "string");
    logger.setformatter(formatter);
    logger.setLogLevel(AHLogLevelEnum.Debug);

    expect(formatter).toHaveBeenCalledTimes(0);
    logger.info("info test");
    expect(formatter).toHaveBeenCalledTimes(1);

    logger.info("info test", { obj: true });
    expect(formatter).toHaveBeenCalledTimes(3);
  });

  test("addHandler", () => {
    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    expect(handler).toHaveBeenCalledTimes(0);
    logger.info("info test");
    expect(handler).toHaveBeenCalledTimes(1);

    logger.info("info test", { obj: true });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("setLogLevel", () => {
    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);
    logger.setLogLevel(AHLogLevelEnum.Error);

    logger.debug("debug test");
    logger.info("info test");
    logger.warn("warn test");
    logger.error("error test");

    expect(handler).toHaveBeenCalledTimes(1);
  });
});