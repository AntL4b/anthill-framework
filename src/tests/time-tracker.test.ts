import { AHException, AHLogger, AHTimeTracker} from "..";
import { AHTimeTrackerStateEnum } from "../core/models/enums/time-tracker-state-enum";


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

    // Tracking stopped
    expect(() => AHTimeTracker.startSegment("test-segment")).toThrow(AHException);

    AHTimeTracker.startTrackingSession();
    const timeSegmentNumber = AHTimeTracker["timeSegments"].length;
    AHTimeTracker.startSegment("test-segment");
    expect(AHTimeTracker["timeSegments"].length).toBeGreaterThan(timeSegmentNumber);

    // Re start existing segment
    expect(() => AHTimeTracker.startSegment("test-segment")).toThrow(AHException);
  });

  test('stopSegment', () => {
    // Reset any eventual session
    AHTimeTracker.startTrackingSession();
    AHTimeTracker.stopTrackingSession();

    AHTimeTracker.startTrackingSession();
    AHTimeTracker.startSegment("test-segment");
    const segment = AHTimeTracker.getSegment("test-segment");
    expect(segment.endTime).toBeFalsy();

    AHTimeTracker.stopSegment("test-segment");
    expect(segment.endTime).toBeTruthy();

    expect(() => AHTimeTracker.stopSegment("inexistant-segment")).toThrow(AHException);
  });

  test('stopSegment when tracking is stopped', () => {
    // Reset any eventual session
    AHTimeTracker.startTrackingSession();
    AHTimeTracker.stopTrackingSession();

    AHTimeTracker.startTrackingSession();
    AHTimeTracker.startSegment("test-segment");
    AHTimeTracker.getSegment("test-segment");
    AHTimeTracker.stopTrackingSession();
    expect(() => AHTimeTracker.stopSegment("test-segment")).toThrow(AHException);
  });

  test('getSegment', () => {
    AHTimeTracker.startTrackingSession();
    AHTimeTracker.startSegment("test-segment");
    expect(AHTimeTracker.getSegment("test-segment")).toBeTruthy();
    expect(() => AHTimeTracker.getSegment("inexistant-segment")).toBeTruthy();
    AHTimeTracker.stopTrackingSession();
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
