---
title: "MCP: Implement List All Tasks Endpoint"
is_done: false
---

This task involves creating an MCP endpoint that allows an AI agent to retrieve a list of all current tasks. This is equivalent to the `mtd list` CLI command.

**Problem Solved:**
Enables AI agents to get an overview of all existing tasks, allowing them to query task statuses, find specific tasks, or perform batch operations.

**Functional Requirements:**

- **FR1: Endpoint Definition:**
  - The system MUST expose an HTTP endpoint for listing all tasks.
  - **Method:** `GET`
  - **Path:** `/tasks`
- **FR2: Request Handling:**
  - The endpoint MUST NOT require a request body or query parameters for basic listing.
- **FR3: Core Logic Integration:**
  - The endpoint handler MUST utilize the existing `GetAllTasksUseCase`.
- **FR4: Success Response:**
  - Upon successful retrieval, the endpoint MUST return an HTTP `200 OK` status.
  - The response body MUST be JSON and include:
    - `status`: "success"
    - `data`: An array of task objects. Each task object MUST contain:
      - `id` (string): The unique identifier of the task.
      - `slug` (string): The slug of the task.
      - `title` (string): The title of the task.
      - `description` (string): The description of the task.
      - `isDone` (boolean): The completion status of the task.
    - If no tasks exist, the `data` array MUST be empty.
    - Example:
      ```json
      {
        "status": "success",
        "data": [
          {
            "id": "123",
            "slug": "123-new-ai-task",
            "title": "New AI Task",
            "description": "Detailed description of what the AI needs to do.",
            "isDone": false
          },
          {
            "id": "124",
            "slug": "124-another-task",
            "title": "Another Task",
            "description": "",
            "isDone": true
          }
        ]
      }
      ```
      ```json
      {
        "status": "success",
        "data": []
      }
      ```
- **FR5: Error Handling:**
  - If the `GetAllTasksUseCase` throws an unexpected error, the endpoint MUST return an HTTP `500 Internal Server Error`.
  - The error response body MUST be JSON and follow the standardized error format (e.g., `{"status": "error", "message": "Detailed error message"}`).

**Out of Scope for this Task:**

- Filtering tasks (e.g., by status, date).
- Pagination for large numbers of tasks.
- Sorting tasks.
- Returning a "description summary" (the full description will be returned as per the `Task` entity).
