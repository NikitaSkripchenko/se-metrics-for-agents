import type { Clock } from "../service/TaskServiceOptions.js";

export function todayFromClock(clock: Clock): string {
  return clock().toISOString().slice(0, 10);
}
