import { AHException, AHLogger, AHTimeSegment } from "..";


describe('AHTimeSegment', () => {
  test('constructor', () => {
    const timeSegment = new AHTimeSegment("test-segment");
    expect(timeSegment).toBeTruthy();
    expect(timeSegment.name).toEqual("test-segment");
  });

  test('start', () => {
    const timeSegment = new AHTimeSegment();
    expect(timeSegment.startTime).toBeFalsy();
    timeSegment.start();
    expect(timeSegment.startTime).toBeTruthy();
    expect(() => timeSegment.start()).toThrow(AHException);
  });

  test('stop', () => {
    const timeSegment = new AHTimeSegment();
    timeSegment.start();
    expect(timeSegment.endTime).toBeFalsy();
    timeSegment.stop();
    expect(timeSegment.endTime).toBeTruthy();
    expect(() => timeSegment.stop()).toThrow(AHException);

    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    const timeSegment2 = new AHTimeSegment();
    timeSegment2.start();
    timeSegment2.stop(true); // verbose mode
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('getDuration', () => {
    const timeSegment = new AHTimeSegment();
    timeSegment.start();
    const d1 = timeSegment.getDuration();
    expect(d1).toBeTruthy();
    timeSegment.stop();
    const d2 = timeSegment.getDuration();
    expect(d2).toBeTruthy();
    expect(d1).toBeLessThan(d2);
    const d3 = timeSegment.getDuration();
    expect(d2).toEqual(d3);
  });

});
