import type { Task, TaskStatus, TaskSummary } from "../../domain.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput
} from "../../schemas.js";
import { createTaskEntity } from "../create/createTaskEntity.js";
import { todayFromClock } from "../date/todayFromClock.js";
import { selectTasks } from "../filtering/selectTasks.js";
import { cloneTask } from "../read/cloneTask.js";
import { InMemoryTaskRepository } from "../storage/InMemoryTaskRepository.js";
import type { TaskRepository } from "../storage/TaskRepository.js";
import { assertAllowedStatusTransition } from "../status/assertAllowedStatusTransition.js";
import { buildTaskSummary } from "../summary/buildTaskSummary.js";
import { applyTaskStatusUpdate } from "../update/applyTaskStatusUpdate.js";
import { applyTaskUpdate } from "../update/applyTaskUpdate.js";
import { assertDueDateIsNotPast } from "../validation/assertDueDateIsNotPast.js";
import { assertTaskExists } from "../validation/assertTaskExists.js";
import { createSequentialTaskIdGenerator } from "./createSequentialTaskIdGenerator.js";
import { defaultClock } from "./defaultClock.js";
import type {
  Clock,
  IdGenerator,
  TaskServiceOptions
} from "./TaskServiceOptions.js";

export class TaskService {
  private readonly repository: TaskRepository;
  private readonly now: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(options: TaskServiceOptions = {}) {
    this.repository = options.repository ?? new InMemoryTaskRepository();
    this.now = options.now ?? defaultClock;
    this.idGenerator =
      options.idGenerator ?? createSequentialTaskIdGenerator();
  }

  create(input: CreateTaskInput): Task {
    assertDueDateIsNotPast(input.dueDate, this.today());

    const task = createTaskEntity(input, this.idGenerator, this.now);
    this.repository.save(task);

    return cloneTask(task);
  }

  list(filters: ListTasksQuery = {}): Task[] {
    return selectTasks(this.repository.findAll(), filters, this.today()).map(
      cloneTask
    );
  }

  get(id: string): Task {
    return cloneTask(this.getExistingTask(id));
  }

  update(id: string, input: UpdateTaskInput): Task {
    const task = this.getExistingTask(id);

    if (input.dueDate !== undefined) {
      assertDueDateIsNotPast(input.dueDate, this.today());
    }

    const updatedTask = applyTaskUpdate(task, input, this.now);
    this.repository.save(updatedTask);

    return cloneTask(updatedTask);
  }

  updateStatus(id: string, status: TaskStatus): Task {
    const task = this.getExistingTask(id);
    assertAllowedStatusTransition(task.status, status);

    const updatedTask = applyTaskStatusUpdate(task, status, this.now);
    this.repository.save(updatedTask);

    return cloneTask(updatedTask);
  }

  delete(id: string): void {
    if (!this.repository.remove(id)) {
      assertTaskExists(undefined);
    }
  }

  summary(): TaskSummary {
    return buildTaskSummary(this.repository.findAll(), this.today());
  }

  private getExistingTask(id: string): Task {
    return assertTaskExists(this.repository.findById(id));
  }

  private today(): string {
    return todayFromClock(this.now);
  }
}
