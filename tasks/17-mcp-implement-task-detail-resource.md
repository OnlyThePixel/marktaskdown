---
title: "MCP: Implement task detail resource"
is_done: false
---

# MCP: Implement task detail resource

## Problem Solved

This task implements the `tasks://{slug}` resource for the MCP server, allowing LLM applications to retrieve detailed information about a specific task through the Model Context Protocol.

## Functional Requirements

- **FR1: Resource Registration**

  - Register the `task` resource with the MCP server
  - Define the URI template: `tasks://{slug}`

- **FR2: Parameter Extraction**

  - Extract the slug parameter from the URI
  - Validate that the slug parameter is a string

- **FR3: Use Case Integration**

  - Integrate with the existing `GetTaskBySlugUseCase`
  - Execute the use case with the extracted slug

- **FR4: Response Formatting**

  - Format the response according to MCP conventions
  - Format the task details as markdown
  - Include task title, status, slug, and description in the response

- **FR5: Error Handling**
  - Implement proper error handling for all operations
  - Return formatted error responses when exceptions occur

## Implementation Details

The implementation should follow this structure (pseudocode):

```
// In the registerResources method of MarkTaskDownMcpServer class

Register resource "task" with URI template "tasks://{slug}" and handler:
  Parameters: slug
  Try:
    Create FileSystemTaskRepository
    Create GetTaskBySlugUseCase with repository
    Execute use case with slug
    Format task details as markdown:
      "# [task.title]

       Status: [Done/Not Done]
       Slug: [task.slug]

       [task.description]"
    Return resource response with formatted task details
  Catch error:
    Return resource response with error message:
      "Error retrieving task: [error message]"
```

## MCP Conventions

- Resource responses should follow the format: `{ contents: [{ uri: "resource://uri", text: "..." }] }`
- The resource should be registered with a simple name (`task`)
- The URI template should follow the pattern `scheme://{parameter}`
- Use ResourceTemplate for parameterized URIs

## Dependencies

- GetTaskBySlugUseCase from the application layer
- FileSystemTaskRepository from the infrastructure layer
- ResourceTemplate from the MCP SDK

## Testing Strategy

- Test the resource with the MCP Inspector
- Verify that the resource correctly returns details for a valid slug
- Verify that the task details are properly formatted
- Verify that errors are properly caught and formatted
