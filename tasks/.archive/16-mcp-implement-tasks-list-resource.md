---
title: "MCP: Implement tasks list resource"
is_done: true
---

# MCP: Implement tasks list resource

## Problem Solved

This task implements the `tasks://list` resource for the MCP server, allowing LLM applications to retrieve a list of all tasks through the Model Context Protocol.

## Functional Requirements

- **FR1: Resource Registration**

  - Register the `tasks` resource with the MCP server
  - Define the URI pattern: `tasks://list`

- **FR2: Use Case Integration**

  - Integrate with the existing `GetAllTasksUseCase`
  - Execute the use case to retrieve all tasks

- **FR3: Response Formatting**

  - Format the response according to MCP conventions
  - Format the task list as a markdown list with status indicators
  - Include task titles and slugs in the response

- **FR4: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerResources method of MarkTaskDownMcpServer class

Register resource "tasks" with URI "tasks://list" and handler:
  Try:
    Create FileSystemTaskRepository
    Create GetAllTasksUseCase with repository
    Execute use case to get all tasks
    Format tasks as markdown list:
      For each task:
        Add line: "- [[x] or [ ]] [task.title] ([task.slug])"
    Return resource response with formatted task list
  Catch error:
    Return resource response with error message:
      "Error listing tasks: [error message]"
```

## MCP Conventions

- Resource responses should follow the format: `{ contents: [{ uri: "resource://uri", text: "..." }] }`
- The resource should be registered with a simple name (`tasks`)
- The URI should follow the pattern `scheme://path`

## Dependencies

- GetAllTasksUseCase from the application layer
- FileSystemTaskRepository from the infrastructure layer

## Testing Strategy

- Test the resource with the MCP Inspector
- Verify that the resource correctly returns a list of all tasks
- Verify that the task list is properly formatted
- Verify that errors are properly caught and formatted
