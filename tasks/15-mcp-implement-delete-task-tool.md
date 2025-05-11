---
title: "MCP: Implement delete-task tool"
is_done: false
---

# MCP: Implement delete-task tool

## Problem Solved

This task implements the `delete-task` tool for the MCP server, allowing LLM applications to delete tasks through the Model Context Protocol.

## Functional Requirements

- **FR1: Tool Registration**

  - Register the `delete-task` tool with the MCP server
  - Define parameter: slug (required)

- **FR2: Parameter Validation**

  - Validate that the slug parameter is provided and is a string
  - Ensure the slug exists before attempting to delete the task

- **FR3: Use Case Integration**

  - Integrate with the existing `DeleteTaskUseCase`
  - Execute the use case with the provided slug

- **FR4: Response Formatting**

  - Format the response according to MCP conventions
  - Include information about the deleted task (slug)

- **FR5: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerTools method of MarkTaskDownMcpServer class

Register tool "delete-task" with:
  Parameters:
    slug: required string
  Handler:
    Try:
      Create FileSystemTaskRepository
      Create DeleteTaskUseCase with repository
      Execute use case with slug
      Return success response with message:
        "Task deleted: [slug]"
    Catch error:
      Return error response with message:
        "Error deleting task: [error message]"
```

## MCP Conventions

- Tool responses should follow the format: `{ content: [{ type: "text", text: "..." }], isError?: boolean }`
- Error responses should set `isError: true` and include a descriptive message
- The tool should be registered with a kebab-case name (`delete-task`)
- Parameters should be validated using zod schemas

## Dependencies

- DeleteTaskUseCase from the application layer
- FileSystemTaskRepository from the infrastructure layer
- zod for parameter validation

## Testing Strategy

- Test the tool with the MCP Inspector
- Verify that the tool correctly deletes a task with a valid slug
- Verify that the tool properly validates parameters
- Verify that errors are properly caught and formatted
