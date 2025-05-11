---
title: "MCP: Implement initialize-project tool"
is_done: true
---

# MCP: Implement initialize-project tool

## Problem Solved

This task implements the `initialize-project` tool for the MCP server, allowing LLM applications to initialize a new MarkTaskDown project through the Model Context Protocol.

## Functional Requirements

- **FR1: Tool Registration**

  - Register the `initialize-project` tool with the MCP server
  - The tool should not require any parameters

- **FR2: Use Case Integration**

  - Integrate with the existing `InitializeProjectUseCase`
  - Execute the use case and handle its result

- **FR3: Response Formatting**

  - Format the response according to MCP conventions
  - Include information about whether the project was initialized or already existed

- **FR4: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerTools method of MarkTaskDownMcpServer class

Register tool "initialize-project" with:
  Parameters: none
  Handler:
    Try:
      Create InitializeProjectUseCase
      Execute use case and get result
      Return success response with message:
        "Project [initialized/already initialized] at [tasksDir]"
    Catch error:
      Return error response with message:
        "Error initializing project: [error message]"
```

## MCP Conventions

- Tool responses should follow the format: `{ content: [{ type: "text", text: "..." }], isError?: boolean }`
- Error responses should set `isError: true` and include a descriptive message
- The tool should be registered with a kebab-case name (`initialize-project`)

## Dependencies

- InitializeProjectUseCase from the application layer
- McpServer from the infrastructure layer

## Testing Strategy

- Test the tool with the MCP Inspector
- Verify that the tool correctly initializes a project when it doesn't exist
- Verify that the tool correctly handles the case when the project already exists
- Verify that errors are properly caught and formatted
