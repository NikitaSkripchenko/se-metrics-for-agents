import type { TaskRepository } from "../storage/TaskRepository.js";

export type Clock = () => Date;
export type IdGenerator = () => string;

export type TaskServiceOptions = {
  now?: Clock;
  idGenerator?: IdGenerator;
  repository?: TaskRepository;
};
