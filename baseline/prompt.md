# Final Baseline Prompt

## Role

You are a senior software engineer building a production-quality TypeScript service from scratch.

## Task

Build a small, complete, and self-contained REST API for task management.

## Constraints

- Node.js >= 18
- TypeScript with strict mode enabled
- REST API
- In-memory persistence only using `Map<string, Task>`
- Zod for validation
- Vitest or Jest for testing
- Deterministic behavior
- Do not optimize for any specific architectural style
- Focus on correctness and completeness of behavior

## Domain Model

```ts
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

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
```

## Business Rules

- `title` is required and must be non-empty.
- `dueDate`, when provided, must be today or a future date.
- Status transitions must be strictly enforced:
  - `todo -> in_progress -> done`
  - `todo -> done`

## API Requirements

Implement the following endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List tasks |
| `GET` | `/tasks/:id` | Get a task by ID |
| `PATCH` | `/tasks/:id` | Update a task |
| `PATCH` | `/tasks/:id/status` | Update task status |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/tasks/summary` | Get task summary |

## Behavior Requirements

### Filtering

`GET /tasks` must support filtering by:

- `status`
- `priority`
- `overdue`
- `dueBefore`
- `dueAfter`
- `search`, matching task title

### Summary

`GET /tasks/summary` must return:

- Total task count
- Counts by status
- Counts by priority
- Overdue task count

## Error Contract

All errors must follow this shape:

```json
{
  "error": "ERROR_CODE",
  "message": "description"
}
```

## Tests

Tests are required and must cover:

- Creation
- Validation
- Status transitions
- Filtering
- Summary
- CRUD behavior

## Output Requirements

Provide:

- Folder tree
- Full code
- Run instructions
