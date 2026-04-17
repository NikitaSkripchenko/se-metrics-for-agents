# HTTP Contract Testing Subproject For Multi-Implementation Task Services

## Abstract

This subproject provides a standalone HTTP contract-testing harness for a family of TypeScript task-management services that share one external REST API while differing internally in project structure. The goal is to verify behavioral equivalence across implementations without relying on internal modules, dependency injection hooks, or in-process app imports. The resulting suite emphasizes black-box execution, process-level isolation, reusable request helpers, and a parity mode that compares a selected implementation against the baseline reference.

## Context

The repository contains four sibling services:

- `baseline`
- `compact`
- `clean`
- `fragmented`

The repository prompts establish `baseline` as the source of truth for public behavior, while the other services must preserve endpoints, request and response formats, validation behavior, and test expectations.

## Observed API Contract

### Endpoints

- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/status`
- `DELETE /tasks/:id`
- `GET /tasks/summary`

### Resource Model

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

type TaskSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
};
```

### Error Contract

All observed error responses follow the same envelope:

```json
{
  "error": "ERROR_CODE",
  "message": "description"
}
```

### Business Rules

- `title` is required and trimmed.
- `description` defaults to `null`.
- `priority` defaults to `medium`.
- `dueDate` defaults to `null`.
- `status` starts as `todo`.
- `dueDate`, when provided, must not be in the past.
- Allowed status transitions are `todo -> in_progress`, `todo -> done`, and `in_progress -> done`.
- `GET /tasks` supports `status`, `priority`, `overdue`, `dueBefore`, `dueAfter`, and `search`.
- Title search is case-insensitive.
- `GET /tasks/summary` returns total counts, counts by status, counts by priority, and an overdue count.

## Methodology

### Black-Box Boundary

The suite communicates over HTTP only. It does not import `createApp`, `TaskService`, repositories, schemas, or any internal modules from the implementations under test.

### Execution Model

Two execution modes are supported:

- Managed mode: the contract suite spawns a sibling package with `npm run dev`, assigns an ephemeral `PORT`, waits for readiness, runs tests, and terminates the process.
- External mode: the suite targets an already running service via `BASE_URL`.

Managed mode is the primary path because it provides process isolation and a clean in-memory state for each test.

### Parity Strategy

For non-baseline targets, the suite can also run a baseline parity scenario. The same HTTP scenario is replayed against the selected target and the baseline oracle, and the responses are compared after normalizing volatile fields such as generated IDs and timestamps.

## Subproject Architecture

```text
contract-tests/
  DOCS.MD
  README.md
  package.json
  tsconfig.json
  vitest.config.ts
  scripts/
    run-matrix.ts
  test/
    support/
      assert.ts
      capabilities.ts
      dates.ts
      env.ts
      http.ts
      normalize.ts
      readiness.ts
      scenario.ts
      server.ts
      targets.ts
      types.ts
    contract/
      create.spec.ts
      crud.spec.ts
      errors.spec.ts
      list.spec.ts
      status.spec.ts
      summary.spec.ts
      validation.spec.ts
    parity/
      baseline-parity.spec.ts
```

## Findings

### Primary Findings

- All four implementations expose the same seven-task-management routes.
- Startup behavior is structurally consistent across implementations: each package uses `npm run dev`, a `src/server.ts` entry point, and a `PORT` environment variable.
- Existing package-local tests are identical in intent and encode the same external contract.
- Public HTTP behavior is stable despite major differences in internal code organization.

### Additional Findings

- Exact generated IDs are not reliable contract material because the black-box servers generate them internally.
- Exact timestamps should not be compared across implementations because they are execution-time artifacts.
- The strongest reusable contract is the request and response behavior at the HTTP boundary, not any specific internal modular shape.

## Limitations

### Observable-System Limitations

- The running servers do not expose a reset endpoint.
- The running servers do not expose an observable clock-control mechanism.
- Positive overdue behavior cannot be tested deterministically over pure HTTP because the API rejects past due dates and the suite cannot advance server time.

### Test-Orchestration Limitations

- External `BASE_URL` mode may point at a dirty or shared instance, which can invalidate state-sensitive assertions.
- Validation messages partially reflect Zod formatting and may be more brittle than business-level error codes.
- If a future implementation intentionally changes list ordering semantics, the current suite may flag that change as a regression.

## Threats To Validity

- The observed contract is inferred from the current codebase and tests rather than an independent formal protocol specification.
- Third-party dependency changes, especially around validation wording, may affect string-level assertions without changing core behavior.
- Black-box parity does not prove semantic equivalence for hidden internal states; it only validates equivalence for the exercised HTTP scenarios.

## Future Work

- Add a standardized test-only clock contract if deterministic overdue-positive testing becomes a requirement.
- Add a standardized reset contract if shared external instances must support full-suite execution.
- Expand parity coverage into a larger scenario catalog or generated request corpus.
- Add richer machine-readable reports for CI trend analysis.

## Reproduction

Install dependencies:

```bash
npm install
```

Run one implementation:

```bash
npm run test:compact
```

Run the full matrix:

```bash
npm run test:all
```

Run against an external server:

```bash
BASE_URL=http://127.0.0.1:3000 npm test
```
