import { ApiError } from "../shared/errors.js";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
  type TaskSummary
} from "./domain.js";
import {
  InMemoryTaskRepository,
  type TaskRepository
} from "./repository.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput
} from "./schemas.js";

type TaskServiceOptions = {
  now?: () => Date;
  idGenerator?: () => string;
  repository?: TaskRepository;
};

const allowedStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress", "done"],
  in_progress: ["done"],
  done: []
};

export class TaskService {
  private readonly repository: TaskRepository;
  private readonly now: () => Date;
  private readonly idGenerator: () => string;
  private nextId = 1;

  constructor(options: TaskServiceOptions = {}) {
    this.repository = options.repository ?? new InMemoryTaskRepository();
    this.now = options.now ?? (() => new Date());
    this.idGenerator =
      options.idGenerator ?? (() => `task_${String(this.nextId++)}`);
  }

  create(input: CreateTaskInput): Task {
    this.assertDueDateIsNotPast(input.dueDate);

    const timestamp = this.now().toISOString();
    const task: Task = {
      id: this.idGenerator(),
      title: input.title,
      description: input.description,
      status: "todo",
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.repository.save(task);
    return cloneTask(task);
  }

  list(filters: ListTasksQuery = {}): Task[] {
    const today = this.today();
    const search = filters.search?.toLocaleLowerCase();

    return this.repository
      .findAll()
      .filter((task) => {
        if (filters.status !== undefined && task.status !== filters.status) {
          return false;
        }

        if (
          filters.priority !== undefined &&
          task.priority !== filters.priority
        ) {
          return false;
        }

        if (
          filters.overdue !== undefined &&
          isTaskOverdue(task, today) !== filters.overdue
        ) {
          return false;
        }

        if (
          filters.dueBefore !== undefined &&
          (task.dueDate === null || task.dueDate > filters.dueBefore)
        ) {
          return false;
        }

        if (
          filters.dueAfter !== undefined &&
          (task.dueDate === null || task.dueDate < filters.dueAfter)
        ) {
          return false;
        }

        if (
          search !== undefined &&
          !task.title.toLocaleLowerCase().includes(search)
        ) {
          return false;
        }

        return true;
      })
      .map(cloneTask);
  }

  get(id: string): Task {
    return cloneTask(this.getExistingTask(id));
  }

  update(id: string, input: UpdateTaskInput): Task {
    const task = this.getExistingTask(id);

    if (input.dueDate !== undefined) {
      this.assertDueDateIsNotPast(input.dueDate);
    }

    const updatedTask: Task = {
      ...task,
      ...input,
      updatedAt: this.now().toISOString()
    };

    this.repository.save(updatedTask);
    return cloneTask(updatedTask);
  }

  updateStatus(id: string, status: TaskStatus): Task {
    const task = this.getExistingTask(id);

    if (!allowedStatusTransitions[task.status].includes(status)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot transition task status from ${task.status} to ${status}.`
      );
    }

    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: this.now().toISOString()
    };

    this.repository.save(updatedTask);
    return cloneTask(updatedTask);
  }

  delete(id: string): void {
    if (!this.repository.delete(id)) {
      throw new ApiError(404, "TASK_NOT_FOUND", "Task was not found.");
    }
  }

  summary(): TaskSummary {
    const today = this.today();
    const summary: TaskSummary = {
      total: this.repository.count(),
      byStatus: zeroCounts(TASK_STATUSES),
      byPriority: zeroCounts(TASK_PRIORITIES),
      overdue: 0
    };

    for (const task of this.repository.findAll()) {
      summary.byStatus[task.status] += 1;
      summary.byPriority[task.priority] += 1;

      if (isTaskOverdue(task, today)) {
        summary.overdue += 1;
      }
    }

    return summary;
  }

  private getExistingTask(id: string): Task {
    const task = this.repository.findById(id);

    if (task === undefined) {
      throw new ApiError(404, "TASK_NOT_FOUND", "Task was not found.");
    }

    return task;
  }

  private assertDueDateIsNotPast(dueDate: string | null): void {
    if (dueDate !== null && dueDate < this.today()) {
      throw new ApiError(
        400,
        "INVALID_DUE_DATE",
        "Due date must be today or a future date."
      );
    }
  }

  private today(): string {
    return this.now().toISOString().slice(0, 10);
  }
}

function cloneTask(task: Task): Task {
  return { ...task };
}

function zeroCounts<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<
    T,
    number
  >;
}

function isTaskOverdue(task: Task, today: string): boolean {
  return task.status !== "done" && task.dueDate !== null && task.dueDate < today;
}
