---
title: "MCP: Implement Initialize Project Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to initialize a new MarkTaskDown project structure programmatically. This is equivalent to the `mtd init` CLI command.

**Problem Solved:**
Enables AI agents to set up the necessary MarkTaskDown directory structure (e.g., the `tasks/` directory) in a new or existing project workspace before they can start managing tasks.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for project initialization.
  - **Method:** `POST`
  - **Path:** `/initialize`
- **FR2: Request Handling:**
  - The endpoint MUST NOT require a request body.
- **FR3: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `InitializeProjectUseCase`.
- **FR4: Success Response:**
  - Upon successful initialization (or if the project was already initialized), the endpoint MUST return an HTTP `200 OK` status.
  - The response body MUST be JSON and include:
    - `status`: "success"
    - `data`: An object containing:
      - `created`: A boolean indicating if the tasks directory was newly created by this call (true) or if it already existed (false). (This comes from `InitializeProjectResultDTO`)
      - `tasksDir`: A string representing the absolute or relative path to the tasks directory. (This comes from `InitializeProjectResultDTO`)
    - Example:
      ```json
      {
        "status": "success",
        "data": {
          "created": true,
          "tasksDir": "/path/to/workspace/tasks"
        }
      }
      ```
- **FR5: Error Handling:**
  - If the `InitializeProjectUseCase` throws an unexpected error (e.g., file system permission issues), the endpoint MUST return an appropriate HTTP error status (e.g., `500 Internal Server Error`).
  - The error response body MUST be JSON and follow the standardized error format (e.g., `{"status": "error", "message": "Detailed error message"}`).

**Out of Scope for this Task:**

- Allowing specification of a custom tasks directory path via the API (the `InitializeProjectUseCase` currently uses a default).
- Re-initialization with destructive actions (the current use case is non-destructive).
