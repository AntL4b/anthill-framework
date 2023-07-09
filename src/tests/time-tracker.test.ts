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
  test('startTrackingSession', () => {
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
    AHTimeTracker.startTrackingSession();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    expect(AHTimeTracker["timeSegments"].length).toBe(1);
    AHTimeTracker.stopTrackingSession();
  });

  test('re startTrackingSession', () => {
    AHTimeTracker.startTrackingSession();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    expect(AHTimeTracker["timeSegments"].length).toBe(1);
    AHTimeTracker.startSegment("test-segment");
    expect(AHTimeTracker["timeSegments"].length).toBe(2);
    AHTimeTracker.startTrackingSession(); // should do nothing
    expect(AHTimeTracker["timeSegments"].length).toBe(2);
    AHTimeTracker.stopTrackingSession();
  });

  test('startSegment', () => {
    // Reset any eventual session
    AHTimeTracker.startTrackingSession();
    AHTimeTracker.stopTrackingSession();

    const timeSegmentNumber = AHTimeTracker["timeSegments"].length;
    AHTimeTracker.startSegment("test-segment");
    const segment = AHTimeTracker["timeSegments"].find(s => s.name === "test-segment");

    expect(AHTimeTracker["timeSegments"].length).toBeGreaterThan(timeSegmentNumber);
    expect(segment).toBeTruthy();
    expect(segment.start).toBeTruthy();

    expect(() => AHTimeTracker.startSegment("test-segment")).toThrow(AHException);
  });

  test('stopSegment', () => {
    // Reset any eventual session
    AHTimeTracker.startTrackingSession();
    AHTimeTracker.stopTrackingSession();

    AHTimeTracker.startSegment("test-segment");
    const segment = AHTimeTracker["timeSegments"].find(s => s.name === "test-segment");

    expect(segment).toBeTruthy();
    expect(segment.end).toBeFalsy();

    const segmentDuration = AHTimeTracker.stopSegment("test-segment");
    expect(segment.end).toBeTruthy();
    expect(segmentDuration).toBeTruthy();

    expect(() => AHTimeTracker.stopSegment("inexistant-segment")).toThrow(AHException);
  });

  test('stopTrackingSession', () => {
    AHTimeTracker.startTrackingSession();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Started);
    AHTimeTracker.stopTrackingSession();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
    AHTimeTracker.stopTrackingSession();
    expect(AHTimeTracker["state"]).toBe(AHTimeTrackerStateEnum.Stopped);
  });

  test('logTrackingSession', () => {
    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    AHTimeTracker.startTrackingSession();
    AHTimeTracker.startSegment("test-segment");
    AHTimeTracker.startSegment("test-segment-2"); // not stopped
    AHTimeTracker.startSegment("test-segment-3");
    AHTimeTracker.stopSegment("test-segment-3");
    AHTimeTracker.stopSegment("test-segment");
    AHTimeTracker.logTrackingSession(); // before stop
    AHTimeTracker.stopTrackingSession();
    AHTimeTracker.logTrackingSession(); // after stop

    expect(handler).toHaveBeenCalled();
  });
});
