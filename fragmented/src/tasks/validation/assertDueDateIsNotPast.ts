import { ApiError } from "../../errors.js";

export function assertDueDateIsNotPast(
  dueDate: string | null,
  today: string
): void {
  if (dueDate !== null && dueDate < today) {
    throw new ApiError(
      400,
      "INVALID_DUE_DATE",
      "Due date must be today or a future date."
    );
  }
}
