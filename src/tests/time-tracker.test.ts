import { AHException, AHLogger, AHTimeTracker} from "..";
import { AHTimeTrackerStateEnum } from "../core/models/enums/time-tracker-state-enum";

// Override default warn and error log method to avoid jest to crash
global.console.error = (message: string) => {
  console.log(`error: ${message}`);
};

global.console.warn = (message: string) => {
  console.log(`warn: ${message}`);
};

describe('AHTimeTracker', () => {
  test('startTracking', () => {
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
    AHTimeTracker.startTracking();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    expect(AHTimeTracker["timeSegments"].length).toBe(1);
    AHTimeTracker.stopTracking();
  });

  test('re startTracking', () => {
    AHTimeTracker.startTracking();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    expect(AHTimeTracker["timeSegments"].length).toBe(1);
    AHTimeTracker.startSegment("test-segment");
    expect(AHTimeTracker["timeSegments"].length).toBe(2);
    AHTimeTracker.startTracking(); // should do nothing
    expect(AHTimeTracker["timeSegments"].length).toBe(2);
    AHTimeTracker.stopTracking();
  });

  test('startSegment', () => {
    AHTimeTracker.startTracking();
    const timeSegmentNumber = AHTimeTracker["timeSegments"].length;
    AHTimeTracker.startSegment("test-segment");
    const segment = AHTimeTracker["timeSegments"].find(s => s.name === "test-segment");

    const timeSegmentNumber2 = AHTimeTracker["timeSegments"].length
    expect(timeSegmentNumber2).toBeGreaterThan(timeSegmentNumber);
    expect(segment).toBeTruthy();
    expect(segment.start).toBeTruthy();

    AHTimeTracker.startSegment("test-segment");
    expect(AHTimeTracker["timeSegments"].length).toBe(timeSegmentNumber2);
    AHTimeTracker.stopTracking();
  });

  test('stopSegment', () => {
    AHTimeTracker.startTracking();
    AHTimeTracker.startSegment("test-segment");
    const segment = AHTimeTracker["timeSegments"].find(s => s.name === "test-segment");

    expect(segment).toBeTruthy();
    expect(segment.end).toBeFalsy();

    AHTimeTracker.stopSegment("test-segment");
    expect(segment.end).toBeTruthy();

    expect(() => AHTimeTracker.stopSegment("inexistant-segment")).toThrow(AHException)
    AHTimeTracker.stopTracking();
  });

  test('stopTracking', () => {
    AHTimeTracker.startTracking();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    AHTimeTracker.stopTracking();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
    AHTimeTracker.stopTracking();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
  });

  test('logTrackingSession', () => {
    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    AHTimeTracker.startTracking();
    AHTimeTracker.startSegment("test-segment");
    AHTimeTracker.startSegment("test-segment-2"); // not stopped
    AHTimeTracker.startSegment("test-segment-3");
    AHTimeTracker.stopSegment("test-segment-3");
    AHTimeTracker.stopSegment("test-segment");
    AHTimeTracker.logTrackingSession(); // before stop
    AHTimeTracker.stopTracking();
    AHTimeTracker.logTrackingSession(); // after stop

    expect(handler).toHaveBeenCalled();
  });
});
