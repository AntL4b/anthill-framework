import { AnthillException } from "./anthill-exception";
import { logInfo } from "./logger";
import { TimeTrackerStateEnum } from "../../core/models/enums/time-tracker-state-enum";
import { TimeSegment } from "./time-segment";

const LOG_SESSION_LINE_LENGTH = 50;

export class TimeTracker {
  private state: TimeTrackerStateEnum = TimeTrackerStateEnum.Stopped;
  private timeSegments: Array<TimeSegment> = [];
  private trackingSessionSegmentName: string;

  /**
   * Start a tracking session
   * @param trackingSessionSegmentName The tracking session segment name
   */
  startTrackingSession(trackingSessionSegmentName: string = "time-tracking-session"): void {
    if (this.state === TimeTrackerStateEnum.Started) {
      logInfo("startTrackingSession has no effect when a time tracking session is running");
      return;
    }

    this.timeSegments = [];
    this.trackingSessionSegmentName = trackingSessionSegmentName;
    this.state = TimeTrackerStateEnum.Started;

    this.startSegment(trackingSessionSegmentName);
  }

  /**
   * Start a new time segment
   * @param segmentName The name of the segment
   */
  startSegment(segmentName: string): void {
    if (this.state === TimeTrackerStateEnum.Stopped) {
      throw new AnthillException("Start segment failed: Time tracker session is stopped");
    }

    if (this.timeSegments.find((s) => s.name === segmentName)) {
      throw new AnthillException(`Time segment ${segmentName} already exists`);
    }

    const segment = new TimeSegment(segmentName);
    segment.start();

    this.timeSegments.push(segment);
  }

  /**
   * Stop an existing time segment
   * @param segmentName The name of the segment
   * @returns The segment duration (ms)
   */
  stopSegment(segmentName: string): number {
    if (this.state === TimeTrackerStateEnum.Stopped) {
      throw new AnthillException("Stop segment failed: Time tracker session is stopped");
    }

    const segment = this.getSegment(segmentName);
    segment.stop();

    return segment.getDuration();
  }

  /**
   * Get a segment from the time tracking session
   * @param segmentName The segment name
   * @returns The segment named by segmentName
   */
  getSegment(segmentName: string): TimeSegment {
    const segmentIndex = this.timeSegments.findIndex((s) => s.name === segmentName);

    if (segmentIndex === -1) {
      throw new AnthillException(`Time segment ${segmentName} doesn't exist`);
    }

    return this.timeSegments[segmentIndex];
  }

  /**
   * Stop the tracking session
   * @returns The tracking session overall duration
   */
  stopTrackingSession(): number {
    if (this.state === TimeTrackerStateEnum.Stopped) {
      logInfo("stopTrackingSession has no effect when no time tracking session is running");
      return 0;
    }

    const sessionDuration = this.stopSegment(this.trackingSessionSegmentName);

    // Stop all unstopped segment
    for (const segment of this.timeSegments) {
      if (!segment.endTime) {
        segment.stop();
      }
    }

    this.state = TimeTrackerStateEnum.Stopped;

    return sessionDuration;
  }

  /**
   * Log the tracking session
   */
  logTrackingSession(): void {
    const maxSegmentNameLength = Math.max(...this.timeSegments.map((s) => s.name.length));
    const now = performance.now();
    const sessionSegment = this.getSegment(this.trackingSessionSegmentName);

    // Don't use getDuration to refer to the same end time (now) for all segments
    const sessionDuration = (sessionSegment.endTime || now) - sessionSegment.startTime;

    for (const segment of this.timeSegments) {
      const segmentDuration = (segment.endTime || now) - segment.startTime;
      const segmentBlocLength = Math.round((segmentDuration / sessionDuration) * LOG_SESSION_LINE_LENGTH);
      const segmentBlocStartIndex = Math.round(
        ((segment.startTime - sessionSegment.startTime) / sessionDuration) * LOG_SESSION_LINE_LENGTH,
      );

      logInfo(
        segment.name.padEnd(maxSegmentNameLength - segment.name.length, " ") +
          ": " +
          "".padStart(segmentBlocStartIndex, ".") +
          "[" +
          "".padStart(segmentBlocLength, "x") +
          "]" +
          "".padStart(LOG_SESSION_LINE_LENGTH - segmentBlocStartIndex - segmentBlocLength, ".") +
          `(${Math.round(segmentDuration * 1000) / 1000} ms)`, // 3 digits round
      );
    }
  }
}
