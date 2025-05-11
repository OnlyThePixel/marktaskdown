---
title: "MCP: Update documentation"
is_done: true
---

# MCP: Update documentation

## Problem Solved

This task updates the project documentation to include information about the MCP server, making it easier for users to understand how to use MarkTaskDown with LLM applications through the Model Context Protocol.

## Functional Requirements

- **FR1: README.md Updates**

  - Add a section about the MCP server to the main README.md file
  - Explain what MCP is and how it can be used with MarkTaskDown
  - Provide instructions for starting the MCP server

- **FR2: Tool Documentation**

  - Document all available tools:
    - `initialize-project`
    - `create-task`
    - `set-task-done`
    - `set-task-undone`
    - `delete-task`
  - Include parameter information and example responses for each tool

- **FR3: Resource Documentation**

  - Document all available resources:
    - `tasks://list`
    - `tasks://{slug}`
  - Include URI patterns and example responses for each resource

- **FR4: Usage Examples**

  - Provide examples of how to use the MCP server with LLM applications
  - Include sample code or commands for common scenarios

- **FR5: Developer Documentation**
  - Update the developer documentation to explain the MCP server architecture
  - Document how to extend the MCP server with new tools and resources

## Implementation Details

The documentation should include the following sections:

1. **Introduction to MCP**

   - Explain what the Model Context Protocol is
   - Describe how it enables LLM applications to interact with MarkTaskDown

2. **Getting Started**

   - Instructions for starting the MCP server:
     - Using the CLI command: `mtd mcp-server`
     - Running the standalone entry point

3. **Available Tools**

   - For each tool, document:
     - Name and description
     - Parameters (required and optional)
     - Example response
     - Error handling

4. **Available Resources**

   - For each resource, document:
     - URI pattern
     - Example response
     - Error handling

5. **Usage Examples**

   - Example of initializing a project
   - Example of creating and managing tasks
   - Example of retrieving task information

6. **Developer Guide**
   - Architecture overview
   - How to add new tools
   - How to add new resources

## Dependencies

- All previous MCP implementation tasks

## Testing Strategy

- Review the documentation for accuracy and completeness
- Verify that all tools and resources are properly documented
- Test the examples to ensure they work as described
