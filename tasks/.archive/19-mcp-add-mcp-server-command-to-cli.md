---
title: "MCP: Add MCP server command to CLI"
is_done: true
---

# MCP: Add MCP server command to CLI

## Problem Solved

This task adds a new command to the MarkTaskDown CLI to start the MCP server, providing users with a convenient way to expose their task management system to LLM applications through the Model Context Protocol.

## Functional Requirements

- **FR1: Command Implementation**

  - Create the `src/ui/cli/commands/mcp-server.ts` file
  - Implement the `mcpServerCommand` function to start the MCP server

- **FR2: CLI Integration**

  - Update `src/ui/cli/index.ts` to include the new command
  - Add the command with appropriate description and action

- **FR3: Error Handling**

  - Implement proper error handling for server initialization
  - Log errors and exit with appropriate status codes

- **FR4: User Feedback**
  - Provide clear feedback to the user when the server starts
  - Include instructions on how to use the server with LLM applications

## Implementation Details

The command implementation should follow this structure (pseudocode):

```
// src/ui/cli/commands/mcp-server.ts

Function mcpServerCommand():
  Try:
    Log "Starting MarkTaskDown MCP Server..."
    Log "This will allow LLM applications to interact with your tasks."
    Create MarkTaskDownMcpServer
    Call server.start()
    Log "MarkTaskDown MCP Server started with STDIO transport"
    Log "The server will continue running until you press Ctrl+C"
  Catch error:
    Log "Error starting MarkTaskDown MCP Server: [error message]"
    Exit process with code 1
```

The CLI integration should follow this structure (pseudocode):

```
// In src/ui/cli/index.ts

// Add the mcp-server command
Add command "mcp-server" with:
  Description: "Start the MarkTaskDown MCP server with STDIO transport"
  Action: Call mcpServerCommand()
```

## Dependencies

- MarkTaskDownMcpServer from the infrastructure layer
- Commander.js for CLI command registration

## Testing Strategy

- Test the command by running `mtd mcp-server`
- Verify that the server starts correctly
- Verify that appropriate feedback is provided to the user
- Verify that errors are properly handled and reported
