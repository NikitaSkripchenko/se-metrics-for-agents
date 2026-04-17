import type { Clock } from "./TaskServiceOptions.js";

export const defaultClock: Clock = () => new Date();
