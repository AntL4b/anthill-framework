import { AnthillException, Logger, TimeTracker } from "../packages";
import { TimeTrackerStateEnum } from "../packages/core/models/enums/time-tracker-state-enum";

describe("TimeTracker", () => {
  test("startTrackingSession", () => {
    const tracker = new TimeTracker();
    expect(tracker["state"]).toEqual(TimeTrackerStateEnum.Stopped);
    tracker.startTrackingSession();
    expect(tracker["state"]).toEqual(TimeTrackerStateEnum.Started);
    expect(tracker["timeSegments"].length).toEqual(1);
  });

  test("re startTrackingSession", () => {
    const tracker = new TimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    expect(tracker["timeSegments"].length).toEqual(2);
    tracker.startTrackingSession(); // should do nothing
    expect(tracker["timeSegments"].length).toEqual(2);
  });

  test("startSegment", () => {
    const tracker = new TimeTracker();

    // Tracking stopped
    expect(() => tracker.startSegment("test-segment")).toThrow(AnthillException);

    tracker.startTrackingSession();
    const timeSegmentNumber = tracker["timeSegments"].length;
    tracker.startSegment("test-segment");

    expect(tracker["timeSegments"].length).toBeGreaterThan(timeSegmentNumber);

    // Re start existing segment
    expect(() => tracker.startSegment("test-segment")).toThrow(AnthillException);
  });

  test("stopSegment", () => {
    const tracker = new TimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");

    const segment = tracker.getSegment("test-segment");
    expect(segment.endTime).toBeFalsy();

    tracker.stopSegment("test-segment");
    expect(segment.endTime).toBeTruthy();

    expect(() => tracker.stopSegment("inexistant-segment")).toThrow(AnthillException);
  });

  test("stopSegment when tracking is stopped", () => {
    const tracker = new TimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    tracker.stopTrackingSession();
    expect(() => tracker.stopSegment("test-segment")).toThrow(AnthillException);
  });

  test("getSegment", () => {
    const tracker = new TimeTracker();
    tracker.startTrackingSession();
    tracker.startSegment("test-segment");
    expect(tracker.getSegment("test-segment")).toBeTruthy();
    expect(() => tracker.getSegment("inexistant-segment")).toThrow(AnthillException);
  });

  test("stopTrackingSession", () => {
    const tracker = new TimeTracker();
    tracker.startTrackingSession();
    expect(tracker["state"]).toEqual(TimeTrackerStateEnum.Started);
    tracker.stopTrackingSession();
    expect(tracker["state"]).toEqual(TimeTrackerStateEnum.Stopped);
    tracker.stopTrackingSession();
    expect(tracker["state"]).toEqual(TimeTrackerStateEnum.Stopped);
  });

  test("logTrackingSession", () => {
    const tracker = new TimeTracker();
    const logger = Logger.getInstance();
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
