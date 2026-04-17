# Contract Tests

Standalone black-box HTTP contract tests for the task management implementations in this repository.

## Purpose

The suite validates that `baseline`, `compact`, `clean`, and `fragmented` expose the same external REST behavior while treating each service as a black box.

## Usage

Install dependencies:

```bash
npm install
```

Run against one managed target:

```bash
npm run test:baseline
npm run test:compact
npm run test:clean
npm run test:fragmented
```

Run the full target matrix:

```bash
npm run test:all
```

Run against an already running external server:

```bash
BASE_URL=http://127.0.0.1:3000 npm test
```

## Environment

- `TARGET`: managed target name. One of `baseline`, `compact`, `clean`, `fragmented`.
- `BASE_URL`: use an already running service instead of spawning a sibling package.
- `CONTRACT_PROFILE`: `full` or `smoke`. Defaults to `full` for managed targets and `smoke` for external URLs.
- `ORACLE_TARGET`: optional parity oracle target. Defaults to `baseline` for non-baseline managed targets.
- `ORACLE_BASE_URL`: optional parity oracle URL for external parity runs.
- `REPORT_DIR`: optional directory for JSON reporter output.

## Notes

- The suite owns process lifecycle in managed mode for isolation.
- Positive overdue assertions are intentionally limited because the services do not expose observable clock control over HTTP.
- Findings and limitations are documented in `DOCS.MD`.
