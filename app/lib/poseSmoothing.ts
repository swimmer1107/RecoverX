/**
 * Stabilizes pose-derived knee angles and rep detection against MediaPipe frame noise.
 */

export type BodySide = "RIGHT" | "LEFT";

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

const DEFAULT_VISIBILITY_MIN = 0.55;

export function landmarkVisibility(lm: PoseLandmark | undefined): number {
  return lm?.visibility ?? 1;
}

export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((rad * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/** Exponential moving average — lower alpha = smoother, higher = more responsive. */
export class EmaSmoother {
  private value: number | null = null;

  constructor(private readonly alpha: number) {}

  reset() {
    this.value = null;
  }

  update(sample: number): number {
    if (this.value === null) {
      this.value = sample;
    } else {
      this.value = this.alpha * sample + (1 - this.alpha) * this.value;
    }
    return this.value;
  }
}

/**
 * Locks to one leg using visibility so the tracked side does not flip every frame.
 */
export class SideTracker {
  private side: BodySide = "RIGHT";
  private switchVotes = 0;

  constructor(
    private readonly visibilityMargin = 0.1,
    private readonly framesToSwitch = 15,
  ) {}

  getSide(): BodySide {
    return this.side;
  }

  reset(side: BodySide = "RIGHT") {
    this.side = side;
    this.switchVotes = 0;
  }

  /**
   * Returns the locked side, or null if neither leg is visible enough.
   */
  update(lm: PoseLandmark[], visibilityMin = DEFAULT_VISIBILITY_MIN): BodySide | null {
    const rightVis =
      (landmarkVisibility(lm[24]) + landmarkVisibility(lm[26]) + landmarkVisibility(lm[28])) / 3;
    const leftVis =
      (landmarkVisibility(lm[23]) + landmarkVisibility(lm[25]) + landmarkVisibility(lm[27])) / 3;

    if (rightVis < visibilityMin && leftVis < visibilityMin) return null;

    let preferred: BodySide;
    if (rightVis >= visibilityMin && leftVis >= visibilityMin) {
      if (rightVis >= leftVis + this.visibilityMargin) preferred = "RIGHT";
      else if (leftVis >= rightVis + this.visibilityMargin) preferred = "LEFT";
      else preferred = this.side;
    } else {
      preferred = rightVis >= leftVis ? "RIGHT" : "LEFT";
    }

    if (preferred === this.side) {
      this.switchVotes = 0;
      return this.side;
    }

    this.switchVotes += 1;
    if (this.switchVotes >= this.framesToSwitch) {
      this.side = preferred;
      this.switchVotes = 0;
    }
    return this.side;
  }
}

export function kneeAngleForSide(
  lm: PoseLandmark[],
  side: BodySide,
  visibilityMin = DEFAULT_VISIBILITY_MIN,
): number | null {
  const [hipIdx, kneeIdx, ankleIdx] = side === "RIGHT" ? [24, 26, 28] : [23, 25, 27];
  const hip = lm[hipIdx];
  const knee = lm[kneeIdx];
  const ankle = lm[ankleIdx];
  if (!hip || !knee || !ankle) return null;

  const vis = Math.min(
    landmarkVisibility(hip),
    landmarkVisibility(knee),
    landmarkVisibility(ankle),
  );
  if (vis < visibilityMin) return null;

  return calculateAngle(hip, knee, ankle);
}

/** Schmitt-trigger style rep counter on a smoothed angle. */
export class RepCounter {
  private state: "extended" | "bent" = "extended";

  constructor(
    private readonly enterBentBelow = 62,
    private readonly exitExtendedAbove = 138,
  ) {}

  reset() {
    this.state = "extended";
  }

  update(smoothedAngle: number): "rep_completed" | null {
    if (this.state === "extended" && smoothedAngle < this.enterBentBelow) {
      this.state = "bent";
      return null;
    }
    if (this.state === "bent" && smoothedAngle > this.exitExtendedAbove) {
      this.state = "extended";
      return "rep_completed";
    }
    return null;
  }
}

export function roundAngle(angle: number): number {
  return Math.round(angle);
}

/** Limits UI updates so React does not re-render on every pose frame. */
export function shouldEmitDisplayAngle(
  lastEmit: { time: number; value: number },
  rounded: number,
  minIntervalMs = 100,
  minDelta = 2,
): boolean {
  const now = Date.now();
  return (
    now - lastEmit.time >= minIntervalMs || Math.abs(rounded - lastEmit.value) >= minDelta
  );
}

/** Red-zone hysteresis to avoid flickering alerts at the threshold. */
export function redZoneState(
  current: boolean,
  deviation: number,
  enterAbove = 32,
  exitBelow = 26,
): boolean {
  if (!current && deviation > enterAbove) return true;
  if (current && deviation <= exitBelow) return false;
  return current;
}
