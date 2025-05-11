# Task Completion Process

1. First, thoroughly analyze existing code to understand what's already implemented
2. Run tests to verify the current state before making changes
3. Implement or fix only what's necessary - don't modify working code
4. Run tests again to ensure everything works correctly
5. Update ALL relevant documentation
6. Mark the task as done using 'mtd done <task-slug>' command (use the exact slug from the task file)
7. Add ALL changed files to git (both task files, implementation files, AND documentation)
8. Make separate commits with appropriate gitmojis for:
   - Implementation changes (🏗️, ✨, 👔, etc. based on change type)
   - Task file updates (📝)
9. Only then use attempt_completion to summarize the work

# Implementation Guidelines

1. For MCP (Model Context Protocol) tasks:

   - Follow the MCP SDK documentation for proper implementation patterns
   - Use the correct import paths from the SDK (e.g., '@modelcontextprotocol/sdk/server/mcp.js')
   - Implement proper error handling for all operations
   - Follow the server implementation patterns shown in the SDK documentation

2. When implementing new features:
   - Start with interfaces and contracts before implementation
   - Follow the existing patterns in the codebase
   - Ensure proper error handling for all operations
   - Add comprehensive tests for both success and error paths
