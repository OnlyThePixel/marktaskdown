---
title: "MCP: Implement create-task tool"
is_done: false
---

# MCP: Implement create-task tool

## Problem Solved

This task implements the `create-task` tool for the MCP server, allowing LLM applications to create new tasks through the Model Context Protocol.

## Functional Requirements

- **FR1: Tool Registration**

  - Register the `create-task` tool with the MCP server
  - Define parameters: title (required), description (optional)

- **FR2: Parameter Validation**

  - Validate that the title parameter is provided and is a string
  - Make the description parameter optional with a default empty string

- **FR3: Use Case Integration**

  - Integrate with the existing `CreateTaskUseCase`
  - Execute the use case with the provided parameters

- **FR4: Response Formatting**

  - Format the response according to MCP conventions
  - Include information about the created task (title, slug)

- **FR5: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerTools method of MarkTaskDownMcpServer class

Register tool "create-task" with:
  Parameters:
    title: required string
    description: optional string (default: "")
  Handler:
    Try:
      Create FileSystemTaskRepository
      Create CreateTaskUseCase with repository
      Execute use case with title and description
      Return success response with message:
        "Task created: [task.title] ([task.slug])"
    Catch error:
      Return error response with message:
        "Error creating task: [error message]"
```

## MCP Conventions

- Tool responses should follow the format: `{ content: [{ type: "text", text: "..." }], isError?: boolean }`
- Error responses should set `isError: true` and include a descriptive message
- The tool should be registered with a kebab-case name (`create-task`)
- Parameters should be validated using zod schemas

## Dependencies

- CreateTaskUseCase from the application layer
- FileSystemTaskRepository from the infrastructure layer
- zod for parameter validation

## Testing Strategy

- Test the tool with the MCP Inspector
- Verify that the tool correctly creates a task with valid parameters
- Verify that the tool properly validates parameters
- Verify that errors are properly caught and formatted
