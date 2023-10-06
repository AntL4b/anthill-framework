import { AHException } from "./anthill-exception";
import { logInfo } from "./logger";

export class AHTimeSegment {
  name?: string;
  startTime: number;
  endTime?: number;

  /**
   * Time segment constructor
   * @param segmentName The name of the segment
   */
  constructor(segmentName: string = null) {
    this.name = segmentName;
  }

  /**
   * Start a the time segment
   */
  start(): void {
    if (this.startTime) {
      throw new AHException(`Segment was already started (${this.name})`);
    }

    this.startTime = performance.now();
  }

  /**
   * Stop the time segment
   * @returns The segment duration (ms)
   */
  stop(verbose: boolean = false): number {
    if (this.endTime) {
      throw new AHException(`Segment was already stopped (${this.name})`);
    }

    this.endTime = performance.now();

    if (verbose) {
      logInfo(
        `Time segment ${this.name ? this.name + ' ' : ''}ends. Start: ${this.startTime} | End: ${this.endTime} | Duration: ${
          this.endTime - this.startTime
        }`,
      );
    }

    return this.endTime - this.startTime;
  }

  /**
   * Get the segment duration
   * @returns The segment duration
   */
  getDuration(): number {
    const endTime = this.endTime || performance.now(); // Use now if the segment is not stopped yet
    return endTime - this.startTime;
  }
}
