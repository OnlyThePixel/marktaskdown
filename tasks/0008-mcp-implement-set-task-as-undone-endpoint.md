---
title: "MCP: Implement Set Task As Undone Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to mark a specific task as "undone" (not completed) using its slug. This is equivalent to the `mtd undone <slug>` CLI command (if it existed, or similar to `mtd add` if a task was accidentally marked done).

**Problem Solved:**
Enables AI agents to revert the status of tasks from "done" to "undone" programmatically. This is useful for correcting mistakes or re-opening tasks that were prematurely marked as complete.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for marking a task as undone.
  - **Method:** `PUT` (as this is an idempotent update to a specific resource's state).
  - **Path:** `/tasks/{slug}/undone` (where `{slug}` is a path parameter representing the task's slug)
- **FR2: Request Handling:**
  - The `slug` path parameter MUST be used to identify the task.
  - The endpoint MUST NOT require a request body.
- **FR3: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `SetTaskAsUndoneUseCase`.
  - The `slug` string from the path parameter MUST be converted into a `Slug` value object before being passed to the use case.
- **FR4: Success Response:**
  - If the task is found and successfully marked as undone, the endpoint MUST return an HTTP `200 OK` status.
  - The response body MUST be JSON and include:
    - `status`: "success"
    - `data`: An object representing the updated task, containing:
      - `id` (string): The unique identifier of the task.
      - `slug` (string): The slug of the task.
      - `title` (string): The title of the task.
      - `description` (string): The description of the task.
      - `isDone` (boolean): The completion status of the task (will be `false`).
    - Example:
      ```json
      {
        "status": "success",
        "data": {
          "id": "123",
          "slug": "123-task-to-reopen",
          "title": "Task to Reopen",
          "description": "This task was marked done, now undone.",
          "isDone": false
        }
      }
      ```
- **FR5: Not Found Response:**
  - If no task with the given slug is found (as per `SetTaskAsUndoneUseCase` throwing an error), the endpoint MUST return an HTTP `404 Not Found` status.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR6: Error Handling (Invalid Slug Format):**
  - If the provided slug format is invalid, the endpoint MUST return an HTTP `400 Bad Request`.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR7: Error Handling (Other):**
  - If the `SetTaskAsUndoneUseCase` throws an unexpected error (other than task not found), the endpoint MUST return an HTTP `500 Internal Server Error`.
  - The error response body MUST be JSON and follow the standardized error format.

**Out of Scope for this Task:**

- Allowing to set `isDone` to `true` via this endpoint (that's for "set as done").
- Modifying other task properties.
