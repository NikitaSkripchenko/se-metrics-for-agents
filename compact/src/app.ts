import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { z, ZodError, type ZodType } from "zod";

const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

type TaskStatus = (typeof TASK_STATUSES)[number];
type TaskPriority = (typeof TASK_PRIORITIES)[number];

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
};

type ErrorResponse = {
  error: string;
  message: string;
};

class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function isValidDateOnly(value: string): boolean {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateOnlySchema = z
  .string()
  .refine(isValidDateOnly, "Expected a valid date in YYYY-MM-DD format");

const optionalDateQuerySchema = z.preprocess(
  firstQueryValue,
  dateOnlySchema.optional()
);

const optionalEnumQuerySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(firstQueryValue, schema.optional());

const optionalBooleanQuerySchema = z.preprocess((value) => {
  const normalized = firstQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return normalized;
}, z.boolean().optional());

const optionalSearchQuerySchema = z.preprocess(
  firstQueryValue,
  z.string().trim().min(1).optional()
);

const taskStatusSchema = z.enum(TASK_STATUSES);
const taskPrioritySchema = z.enum(TASK_PRIORITIES);

const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().nullable().optional().default(null),
    priority: taskPrioritySchema.optional().default("medium"),
    dueDate: dateOnlySchema.nullable().optional().default(null)
  })
  .strict();

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    description: z.string().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: dateOnlySchema.nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

const updateTaskStatusSchema = z
  .object({
    status: taskStatusSchema
  })
  .strict();

const listTasksQuerySchema = z
  .object({
    status: optionalEnumQuerySchema(taskStatusSchema),
    priority: optionalEnumQuerySchema(taskPrioritySchema),
    overdue: optionalBooleanQuerySchema,
    dueBefore: optionalDateQuerySchema,
    dueAfter: optionalDateQuerySchema,
    search: optionalSearchQuerySchema
  })
  .strict();

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

type TaskServiceOptions = {
  now?: () => Date;
  idGenerator?: () => string;
};

const allowedStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress", "done"],
  in_progress: ["done"],
  done: []
};

export class TaskService {
  private readonly tasks = new Map<string, Task>();
  private readonly now: () => Date;
  private readonly idGenerator: () => string;
  private nextId = 1;

  constructor(options: TaskServiceOptions = {}) {
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

    this.tasks.set(task.id, task);
    return cloneTask(task);
  }

  list(filters: ListTasksQuery = {}): Task[] {
    const today = this.today();
    const search = filters.search?.toLocaleLowerCase();

    return Array.from(this.tasks.values())
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

    this.tasks.set(id, updatedTask);
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

    this.tasks.set(id, updatedTask);
    return cloneTask(updatedTask);
  }

  delete(id: string): void {
    if (!this.tasks.delete(id)) {
      throw new ApiError(404, "TASK_NOT_FOUND", "Task was not found.");
    }
  }

  summary(): TaskSummary {
    const today = this.today();
    const summary: TaskSummary = {
      total: this.tasks.size,
      byStatus: zeroCounts(TASK_STATUSES),
      byPriority: zeroCounts(TASK_PRIORITIES),
      overdue: 0
    };

    for (const task of this.tasks.values()) {
      summary.byStatus[task.status] += 1;
      summary.byPriority[task.priority] += 1;

      if (isTaskOverdue(task, today)) {
        summary.overdue += 1;
      }
    }

    return summary;
  }

  private getExistingTask(id: string): Task {
    const task = this.tasks.get(id);

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

export function createApp(taskService = new TaskService()) {
  const app = express();

  app.use(express.json());

  app.post("/tasks", (request, response, next) => {
    try {
      const input = parse(createTaskSchema, request.body);
      response.status(201).json(taskService.create(input));
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks/summary", (_request, response, next) => {
    try {
      response.json(taskService.summary());
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks", (request, response, next) => {
    try {
      const query = parse(listTasksQuerySchema, request.query);
      response.json(taskService.list(query));
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks/:id", (request, response, next) => {
    try {
      response.json(taskService.get(request.params.id));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/tasks/:id", (request, response, next) => {
    try {
      const input = parse(updateTaskSchema, request.body);
      response.json(taskService.update(request.params.id, input));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/tasks/:id/status", (request, response, next) => {
    try {
      const input = parse(updateTaskStatusSchema, request.body);
      response.json(taskService.updateStatus(request.params.id, input.status));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/tasks/:id", (request, response, next) => {
    try {
      taskService.delete(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => {
    response
      .status(404)
      .json(errorResponse("NOT_FOUND", "Requested route was not found."));
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction
    ) => {
      if (isJsonSyntaxError(error)) {
        response
          .status(400)
          .json(errorResponse("INVALID_JSON", "Request body is not valid JSON."));
        return;
      }

      if (error instanceof ApiError) {
        response
          .status(error.statusCode)
          .json(errorResponse(error.code, error.message));
        return;
      }

      response
        .status(500)
        .json(errorResponse("INTERNAL_ERROR", "Unexpected server error."));
    }
  );

  return app;
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", formatZodError(result.error));
  }

  return result.data;
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
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

function errorResponse(error: string, message: string): ErrorResponse {
  return { error, message };
}
