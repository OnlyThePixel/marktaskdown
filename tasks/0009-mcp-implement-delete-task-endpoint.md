---
title: "MCP: Implement Delete Task Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to delete a specific task using its slug. This is equivalent to the `mtd delete <slug>` CLI command.

**Problem Solved:**
Enables AI agents to remove tasks programmatically, which is necessary for cleaning up completed or irrelevant items and maintaining an organized task list.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for deleting a task.
  - **Method:** `DELETE`
  - **Path:** `/tasks/{slug}` (where `{slug}` is a path parameter representing the task's slug)
- **FR2: Request Handling:**
  - The `slug` path parameter MUST be used to identify the task.
  - The endpoint MUST NOT require a request body.
- **FR3: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `DeleteTaskUseCase`.
  - The `slug` string from the path parameter MUST be converted into a `Slug` value object before being passed to the use case.
- **FR4: Success Response:**
  - If the task is found and successfully deleted, the endpoint MUST return an HTTP `204 No Content` with no body.
- **FR5: Not Found Response:**
  - If no task with the given slug is found (as per `DeleteTaskUseCase` throwing an error), the endpoint MUST return an HTTP `404 Not Found` status.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR6: Error Handling (Invalid Slug Format):**
  - If the provided slug format is invalid, the endpoint MUST return an HTTP `400 Bad Request`.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR7: Error Handling (Other):**
  - If the `DeleteTaskUseCase` throws an unexpected error (other than task not found), the endpoint MUST return an HTTP `500 Internal Server Error`.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR8: Deletion Type:**
  - The deletion performed by this endpoint will be a **hard delete** (the task is permanently removed from the system), consistent with the current `DeleteTaskUseCase` implementation. Soft delete/archiving is out of scope for this iteration.

**Out of Scope for this Task:**

- Soft delete or archiving functionality.
- Batch deletion of tasks.
