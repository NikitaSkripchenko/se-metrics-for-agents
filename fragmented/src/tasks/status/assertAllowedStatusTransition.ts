import {
  canTransitionTaskStatus
} from "../../domain/statusTransitions.js";
import type { TaskStatus } from "../../domain.js";
import { ApiError } from "../../errors.js";

export function assertAllowedStatusTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus
): void {
  if (!canTransitionTaskStatus(currentStatus, nextStatus)) {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition task status from ${currentStatus} to ${nextStatus}.`
    );
  }
}
