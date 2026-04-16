## Context

You are given the BASELINE version of a TypeScript task management service.

The baseline project is the single source of truth.

### Baseline Project 
/baseline


## Rules

You must preserve:
- domain model
- business rules
- API behavior
- request/response formats
- validation logic
- test expectations

You must NOT:
- redesign functionality
- add features
- remove features
- change public behavior

Only project structure may be changed.

## Task

Transform the BASELINE project into a **COMPACT structure**.

## Goals

- minimize number of files
- reduce abstraction layers
- group related logic
- inline simple abstractions
- increase locality of logic

## Constraints

- keep endpoints identical
- keep tests identical
- keep behavior identical

## Output

1. Updated folder structure
2. Full code (file-by-file)
3. Confirmation of functional equivalence