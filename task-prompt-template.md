Execute the next available task (checkout "tasks" resource)

## Task Context

This is part of the MarkTaskDown (mtd) CLI tool project, which uses a clean architecture approach with domain-driven design principles. The codebase is organized into domain entities, repositories, use cases, and UI components.

## Development Approach

Follow the TDD Red-Green-Refactor methodology:

1. RED: First examine and understand the existing tests or write new tests that initially fail
2. GREEN: Implement the minimal code needed to make the tests pass
3. REFACTOR: Clean up the code while keeping tests passing

## Implementation Guidelines

1. For MCP (Model Context Protocol) tasks:

   - Follow the MCP SDK documentation for proper implementation patterns
   - Use the correct import paths from the SDK (e.g., '@modelcontextprotocol/sdk/server/mcp.js')
   - Implement proper error handling for all operations
   - Use module-level mocking in tests (vi.mock() at the top level)

2. For testing:
   - Mock external dependencies at the module level
   - Test both success and error paths
   - Use vi.clearAllMocks() in afterEach hooks

## Completion Steps

1. Run tests to verify they fail before implementation (to avoid false positives)
2. Implement the required functionality
3. Run tests to ensure they pass
4. Mark the task as done using the `set-task-done` tool (use the exact slug from the task file)
5. Commit implementation changes using the appropriate gitmoji prefix (checkout the [.gitmessage](./.gitmessage) file)
6. Commit task file updates separately using the 📝 gitmoji

## Definition of Done

- All tests pass
- Code follows project architecture and patterns
- Task is marked as done using the mtd CLI
- Changes are committed with proper commit message format
