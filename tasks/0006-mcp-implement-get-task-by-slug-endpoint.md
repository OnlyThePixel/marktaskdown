---
title: "MCP: Implement Get Task By Slug Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to retrieve the full details of a specific task by its unique slug.

**Problem Solved:**
Enables AI agents to fetch detailed information about a particular task when they know its slug, which is crucial for updating, deleting, or checking the status of specific tasks.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for retrieving a task by its slug.
  - **Method:** `GET`
  - **Path:** `/tasks/{slug}` (where `{slug}` is a path parameter representing the task's slug)
- **FR2: Request Handling:**
  - The `slug` path parameter MUST be used to identify the task.
- **FR3: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `GetTaskBySlugUseCase`.
  - The `slug` string from the path parameter MUST be converted into a `Slug` value object before being passed to the use case.
- **FR4: Success Response (Task Found):**
  - If a task with the given slug is found, the endpoint MUST return an HTTP `200 OK` status.
  - The response body MUST be JSON and include:
    - `status`: "success"
    - `data`: An object representing the task, containing:
      - `id` (string): The unique identifier of the task.
      - `slug` (string): The slug of the task.
      - `title` (string): The title of the task.
      - `description` (string): The description of the task.
      - `isDone` (boolean): The completion status of the task.
    - Example:
      ```json
      {
        "status": "success",
        "data": {
          "id": "123",
          "slug": "123-specific-ai-task",
          "title": "Specific AI Task",
          "description": "Details for this specific task.",
          "isDone": false
        }
      }
      ```
- **FR5: Not Found Response:**
  - If no task with the given slug is found, the endpoint MUST return an HTTP `404 Not Found` status.
  - The response body MUST be JSON and follow the standardized error format, e.g.:
    ```json
    {
      "status": "fail",
      "data": { "slug": "Task with slug 'non-existent-slug' not found." }
    }
    ```
    (Note: The JSend spec suggests "fail" for client errors like invalid input, which a non-existent slug could be considered. Alternatively, a generic error message with "status": "error" is also acceptable.)
- **FR6: Error Handling (Invalid Slug Format):**
  - If the provided slug format is invalid (e.g., fails `Slug` value object validation), the endpoint MUST return an HTTP `400 Bad Request`.
  - The error response body MUST be JSON and follow the standardized error format.
- **FR7: Error Handling (Other):**
  - If the `GetTaskBySlugUseCase` throws an unexpected error, the endpoint MUST return an HTTP `500 Internal Server Error`.
  - The error response body MUST be JSON and follow the standardized error format.

**Out of Scope for this Task:**

- Retrieving tasks by ID (only by slug).
