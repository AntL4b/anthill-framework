import { AnthillException, Logger, TimeSegment } from "../packages";

describe("TimeSegment", () => {
  test("constructor", () => {
    const timeSegment = new TimeSegment("test-segment");
    expect(timeSegment).toBeTruthy();
    expect(timeSegment.name).toEqual("test-segment");
  });

  test("start", () => {
    const timeSegment = new TimeSegment();
    expect(timeSegment.startTime).toBeFalsy();
    timeSegment.start();
    expect(timeSegment.startTime).toBeTruthy();
    expect(() => timeSegment.start()).toThrow(AnthillException);
  });

  test("stop", () => {
    const timeSegment = new TimeSegment();
    timeSegment.start();
    expect(timeSegment.endTime).toBeFalsy();
    timeSegment.stop();
    expect(timeSegment.endTime).toBeTruthy();
    expect(() => timeSegment.stop()).toThrow(AnthillException);

    const logger = Logger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    const timeSegment2 = new TimeSegment();
    timeSegment2.start();
    timeSegment2.stop(true); // verbose mode

    const timeSegment3 = new TimeSegment("segment-name");
    timeSegment3.start();
    timeSegment3.stop(true); // verbose mode

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("getDuration", () => {
    const timeSegment = new TimeSegment();
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
