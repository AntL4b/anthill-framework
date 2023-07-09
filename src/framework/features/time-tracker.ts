
import { AHException } from "./anthill-exception";
import { logInfo } from "./logger";
import { AHTimeTrackerStateEnum } from "../../core/models/enums/time-tracker-state-enum";
import { AHTimeSegment } from "./time-segment";


const LOG_SESSION_LINE_LENGTH = 50;

export class AHTimeTracker {

  private static state: AHTimeTrackerStateEnum = AHTimeTrackerStateEnum.Stopped;
  private static timeSegments: Array<AHTimeSegment> = [];
  private static trackingSessionSegmentName: string;

  /**
   * Start a tracking session
   * @param trackingSessionSegmentName The tracking session segment name
   * @returns 
   */
  static startTrackingSession(trackingSessionSegmentName: string = "time-tracking-session"): void {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Started) {
      logInfo("startTrackingSession has no effect when a time tracking session is running");
      return;
    }

    if (AHTimeTracker.timeSegments.length > 0) {
      logInfo("startTrackingSession will remove all previous segments");
    }

    AHTimeTracker.timeSegments = [];
    AHTimeTracker.trackingSessionSegmentName = trackingSessionSegmentName;
    AHTimeTracker.state = AHTimeTrackerStateEnum.Started;

    AHTimeTracker.startSegment(trackingSessionSegmentName);
  }

  /**
   * Start a new time segment
   * @param segmentName The name of the segment
   * @returns 
   */
  static startSegment(segmentName: string): void {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Stopped) {
      throw new AHException("Start segment failed: Time tracker session is stopped")
    }

    if (AHTimeTracker.timeSegments.find(s => s.name === segmentName)) {
      throw new AHException(`Time segment ${segmentName} already exists`);
    }

    const segment = new AHTimeSegment(segmentName);
    segment.start();

    AHTimeTracker.timeSegments.push(segment);
  }

  /**
   * Stop an existing time segment
   * @param segmentName The name of the segment
   * @returns The segment duration (ms)
   */
  static stopSegment(segmentName: string): number {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Stopped) {
      throw new AHException("Stop segment failed: Time tracker session is stopped")
    }

    const segment = AHTimeTracker.getSegment(segmentName);
    segment.stop();

    return segment.getDuration();
  }

  /**
   * Get a segment from the time tracking session
   * @param segmentName The segment name
   * @returns The segment named by segmentName
   */
  static getSegment(segmentName: string): AHTimeSegment {
    const segmentIndex = AHTimeTracker.timeSegments.findIndex(s => s.name === segmentName);

    if (segmentIndex === -1) {
      throw new AHException(`Time segment ${segmentName} doesn't exist`);
    }

    return AHTimeTracker.timeSegments[segmentIndex];
  }

  /**
   * Stop the tracking session
   * @returns The tracking session overall duration
   */
  static stopTrackingSession(): number {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Stopped) {
      logInfo("stopTrackingSession has no effect when no time tracking session is running");
      return 0;
    }

    const sessionDuration = AHTimeTracker.stopSegment(AHTimeTracker.trackingSessionSegmentName);

    // Stop all unstopped segment
    for (const segment of AHTimeTracker.timeSegments) {
      if (!segment.endTime) {
        segment.stop();
      }
    }
    
    AHTimeTracker.state = AHTimeTrackerStateEnum.Stopped;

    return sessionDuration;
  }

  /**
   * Log the tracking session
   * @returns
   */
  static logTrackingSession(): void {
    const maxSegmentNameLength = Math.max(...AHTimeTracker.timeSegments.map(s => s.name.length));

    const getXPointsStr = (x: number) => {
      let res = "";
      while (res.length < x) { res = res + '.'; }
      return res;
    }

    const getXSpacesStr = (x: number) => {
      let res = "";
      while (res.length < x) { res = res + ' '; }
      return res;
    }

    const getXXStr = (x: number) => {
      let res = "";
      while (res.length < x) { res = res + 'x'; }
      return res;
    }

    const fillStrWithTrailingSpaces = (str: string, length: number) => {
      return str + getXSpacesStr(length - str.length);
    }

    const now = performance.now();
    const sessionSegment = AHTimeTracker.getSegment(AHTimeTracker.trackingSessionSegmentName);

    // Don't use getDuration to refer to the same end time (now) for all segments 
    const sessionDuration = (sessionSegment.endTime || now) - sessionSegment.startTime;

    for (const segment of AHTimeTracker.timeSegments) {
      const segmentDuration = (segment.endTime || now) - segment.startTime;
      const segmentBlocLength = Math.round(segmentDuration / sessionDuration * LOG_SESSION_LINE_LENGTH);
      const segmentBlocStartIndex = Math.round((segment.startTime - sessionSegment.startTime) / sessionDuration * LOG_SESSION_LINE_LENGTH);

      logInfo(
        fillStrWithTrailingSpaces(segment.name, maxSegmentNameLength) + ': '
        + getXPointsStr(segmentBlocStartIndex)
        + "[" + getXXStr(segmentBlocLength) + ']'
        + getXPointsStr(LOG_SESSION_LINE_LENGTH - segmentBlocStartIndex - segmentBlocLength)
        + `(${segmentDuration}ms)`
      );
    }
  }
}