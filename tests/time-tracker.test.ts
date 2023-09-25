import { AHException, AHLogger, AHTimeTracker } from "../packages";
import { AHTimeTrackerStateEnum } from "../packages/core/models/enums/time-tracker-state-enum";

describe("AHTimeTracker", () => {
  test("startTrackingSession", () => {
    const tracker = new AHTimeTracker();
    expect(tracker["state"]).toEqual(AHTimeTrackerStateEnum.Stopped);
    tracker.startTrackingSession();
    expect(tracker["state"]).toEqual(AHTimeTrackerStateEnum.Started);
    expect(tracker["timeSegments"].length).toEqual(1);
  });

  test("re startTrackingSession", () => {
    const tracker = new AHTimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    expect(tracker["timeSegments"].length).toEqual(2);
    tracker.startTrackingSession(); // should do nothing
    expect(tracker["timeSegments"].length).toEqual(2);
  });

  test("startSegment", () => {
    const tracker = new AHTimeTracker();

    // Tracking stopped
    expect(() => tracker.startSegment("test-segment")).toThrow(AHException);

    tracker.startTrackingSession();
    const timeSegmentNumber = tracker["timeSegments"].length;
    tracker.startSegment("test-segment");

    expect(tracker["timeSegments"].length).toBeGreaterThan(timeSegmentNumber);

    // Re start existing segment
    expect(() => tracker.startSegment("test-segment")).toThrow(AHException);
  });

  test("stopSegment", () => {
    const tracker = new AHTimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");

    const segment = tracker.getSegment("test-segment");
    expect(segment.endTime).toBeFalsy();

    tracker.stopSegment("test-segment");
    expect(segment.endTime).toBeTruthy();

    expect(() => tracker.stopSegment("inexistant-segment")).toThrow(AHException);
  });

  test("stopSegment when tracking is stopped", () => {
    const tracker = new AHTimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    tracker.stopTrackingSession();
    expect(() => tracker.stopSegment("test-segment")).toThrow(AHException);
  });

  test("getSegment", () => {
    const tracker = new AHTimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    expect(tracker.getSegment("test-segment")).toBeTruthy();
    expect(() => tracker.getSegment("inexistant-segment")).toThrow(AHException);
  });

  test("stopTrackingSession", () => {
    const tracker = new AHTimeTracker();
    tracker.startTrackingSession();
    expect(tracker["state"]).toEqual(AHTimeTrackerStateEnum.Started);
    tracker.stopTrackingSession();
    expect(tracker["state"]).toEqual(AHTimeTrackerStateEnum.Stopped);
    tracker.stopTrackingSession();
    expect(tracker["state"]).toEqual(AHTimeTrackerStateEnum.Stopped);
  });

  test("logTrackingSession", () => {
    const tracker = new AHTimeTracker();
    const logger = AHLogger.getInstance();
    const handler = jest.fn(() => {});
    logger.addHandler(handler);

    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    tracker.startSegment("test-segment-2"); // not stopped
    tracker.startSegment("test-segment-3");
    tracker.stopSegment("test-segment-3");
    tracker.stopSegment("test-segment");
    tracker.logTrackingSession(); // before stop
    tracker.stopTrackingSession();
    tracker.logTrackingSession(); // after stop

    expect(handler).toHaveBeenCalled();
  });
});
