---
title: "MCP: Implement Create Task Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to create a new task programmatically. This is equivalent to the `mtd add` CLI command.

**Problem Solved:**
Enables AI agents to add new tasks to MarkTaskDown, allowing them to manage their to-do items, track progress, and integrate task creation into their automated workflows.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for task creation.
  - **Method:** `POST`
  - **Path:** `/tasks`
- **FR2: Request Body:**
  - The endpoint MUST accept a JSON request body with the following fields:
    - `title` (string, **required**): The title of the task.
    - `description` (string, **optional**): The description of the task. If not provided, it should default to an empty string when calling the `CreateTaskUseCase`.
  - Example:
    ```json
    {
      "title": "New AI Task",
      "description": "Detailed description of what the AI needs to do."
    }
    ```
    ```json
    {
      "title": "Quick AI Task"
    }
    ```
- **FR3: Input Validation:**
  - The `title` field MUST NOT be empty. If it is, the endpoint should return an HTTP `400 Bad Request` error.
- **FR4: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `CreateTaskUseCase`.
  - If `description` is not provided in the request, an empty string MUST be passed for the `description` field in the `CreateTaskDTO` supplied to the use case.
- **FR5: Success Response:**
  - Upon successful task creation, the endpoint MUST return an HTTP `201 Created` status.
  - The response body MUST be JSON and include:
    - `status`: "success"
    - `data`: An object representing the created task, containing:
      - `id` (string): The unique identifier of the task.
      - `slug` (string): The slug of the task.
      - `title` (string): The title of the task.
      - `description` (string): The description of the task.
      - `isDone` (boolean): The completion status of the task (will be `false` for new tasks).
    - Example:
      ```json
      {
        "status": "success",
        "data": {
          "id": "123",
          "slug": "123-new-ai-task",
          "title": "New AI Task",
          "description": "Detailed description of what the AI needs to do.",
          "isDone": false
        }
      }
      ```
- **FR6: Error Handling:**
  - If the `CreateTaskUseCase` throws an error (e.g., validation error within value objects, repository save failure), the endpoint MUST return an appropriate HTTP error status (e.g., `400 Bad Request` for validation issues, `500 Internal Server Error` for persistence issues).
  - The error response body MUST be JSON and follow the standardized error format (e.g., `{"status": "error", "message": "Detailed error message"}`).

**Out of Scope for this Task:**

- Allowing setting `isDone` status during creation (new tasks are always not done).
- Assigning tasks to projects or contexts (if such features are added later).
- File attachments or other complex metadata.
