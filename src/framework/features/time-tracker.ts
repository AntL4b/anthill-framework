
import { AHException } from "./anthill-exception";
import { logError, logInfo, logWarn } from "./logger";
import { AHTimeTrackerStateEnum } from "../../core/models/enums/time-tracker-state-enum";
import { AHTimeSegment } from "../../core/models/time-segment";


const LOG_SESSION_LINE_LENGTH = 50;

export class AHTimeTracker {

  private static state: AHTimeTrackerStateEnum = AHTimeTrackerStateEnum.Stopped;
  private static timeSegments: Array<AHTimeSegment>;
  private static trackingSessionSegmentName: string;

  /**
   * Start a tracking session
   * @param trackingSessionSegmentName The tracking session segment name
   * @returns 
   */
  static startTracking(trackingSessionSegmentName: string = "global-session"): void {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Started) {
      logWarn("startTrackingTime has no effect when time tracker is started");
      return;
    }

    AHTimeTracker.timeSegments = [];
    AHTimeTracker.trackingSessionSegmentName = trackingSessionSegmentName;
    AHTimeTracker.startSegment(trackingSessionSegmentName);
    AHTimeTracker.state = AHTimeTrackerStateEnum.Started;
  }

  /**
   * Start a new time segment
   * @param segmentName The name of the segment
   * @returns 
   */
  static startSegment(segmentName: string): void {
    if (AHTimeTracker.timeSegments.find(s => s.name === segmentName)) {
      logError(`Time segment ${segmentName} already exists`);
      return;
    }

    AHTimeTracker.timeSegments.push({
      name: segmentName,
      start: performance.now(),
    });
  }

  /**
   * Stop an existing time segment
   * @param segmentName The name of the segment
   * @returns Ther segment duration (ms)
   */
  static stopSegment(segmentName: string): number {
    const segmentIndex = AHTimeTracker.timeSegments.findIndex(s => s.name === segmentName);

    if (segmentIndex === -1) {
      throw new AHException(`Time segment ${segmentName} doesn't exist`);
    }

    AHTimeTracker.timeSegments[segmentIndex].end = performance.now();

    return AHTimeTracker.timeSegments[segmentIndex].end - AHTimeTracker.timeSegments[segmentIndex].start;
  }

  /**
   * Stop the tracking session
   * @returns The tracking session overall duration
   */
  static stopTracking(): number {
    if (AHTimeTracker.state === AHTimeTrackerStateEnum.Stopped) {
      logWarn("stopTrackingTime has no effect when time tracker is stopped");
      return 0;
    }

    const sessionDuration = AHTimeTracker.stopSegment(AHTimeTracker.trackingSessionSegmentName);
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
    const sessionSegment = AHTimeTracker.timeSegments.find(s => s.name === AHTimeTracker.trackingSessionSegmentName);
    const sessionDuration = (sessionSegment.end || now) - sessionSegment.start;

    for (let segment of AHTimeTracker.timeSegments) {
      const segmentDuration = (segment.end || now) - segment.start;
      const segmentBlocLength = Math.round(segmentDuration / sessionDuration * LOG_SESSION_LINE_LENGTH);
      const segmentBlocStartIndex = Math.round((segment.start - sessionSegment.start) / sessionDuration * LOG_SESSION_LINE_LENGTH);

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