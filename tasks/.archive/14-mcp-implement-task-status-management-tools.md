---
title: "MCP: Implement task status management tools"
is_done: true
---

# MCP: Implement task status management tools

## Problem Solved

This task implements the `set-task-done` and `set-task-undone` tools for the MCP server, allowing LLM applications to manage task status through the Model Context Protocol.

## Functional Requirements

- **FR1: Set Task Done Tool**

  - Register the `set-task-done` tool with the MCP server
  - Define parameter: slug (required)
  - Integrate with the existing `SetTaskAsDoneUseCase`

- **FR2: Set Task Undone Tool**

  - Register the `set-task-undone` tool with the MCP server
  - Define parameter: slug (required)
  - Integrate with the existing `SetTaskAsUndoneUseCase`

- **FR3: Parameter Validation**

  - Validate that the slug parameter is provided and is a string
  - Ensure the slug exists before attempting to update the task

- **FR4: Response Formatting**

  - Format the responses according to MCP conventions
  - Include information about the updated task (title, slug, status)

- **FR5: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerTools method of MarkTaskDownMcpServer class

// Set task as done tool
Register tool "set-task-done" with:
  Parameters:
    slug: required string
  Handler:
    Try:
      Create FileSystemTaskRepository
      Create SetTaskAsDoneUseCase with repository
      Execute use case with slug
      Return success response with message:
        "Task marked as done: [task.title] ([task.slug])"
    Catch error:
      Return error response with message:
        "Error marking task as done: [error message]"

// Set task as undone tool
Register tool "set-task-undone" with:
  Parameters:
    slug: required string
  Handler:
    Try:
      Create FileSystemTaskRepository
      Create SetTaskAsUndoneUseCase with repository
      Execute use case with slug
      Return success response with message:
        "Task marked as undone: [task.title] ([task.slug])"
    Catch error:
      Return error response with message:
        "Error marking task as undone: [error message]"
```

## MCP Conventions

- Tool responses should follow the format: `{ content: [{ type: "text", text: "..." }], isError?: boolean }`
- Error responses should set `isError: true` and include a descriptive message
- The tools should be registered with kebab-case names (`set-task-done`, `set-task-undone`)
- Parameters should be validated using zod schemas

## Dependencies

- SetTaskAsDoneUseCase from the application layer
- SetTaskAsUndoneUseCase from the application layer
- FileSystemTaskRepository from the infrastructure layer
- zod for parameter validation

## Testing Strategy

- Test the tools with the MCP Inspector
- Verify that the tools correctly update task status
- Verify that the tools properly validate parameters
- Verify that errors are properly caught and formatted
