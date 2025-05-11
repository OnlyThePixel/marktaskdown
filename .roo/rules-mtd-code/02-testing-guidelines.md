# Testing Guidelines

1. CRITICAL: For mocking dependencies in tests:

   - Use vi.mock() at the top level of the test file, not inside test functions
   - Mock at the module level when possible, not individual methods
   - Use mockImplementation() to provide mock behavior
   - Use mockClear() between tests to reset mock state
   - Use vi.clearAllMocks() in afterEach() to reset all mocks

2. When testing asynchronous code:

   - Use async/await syntax consistently
   - Test both success and error paths
   - Mock promises with mockResolvedValue() and mockRejectedValue()

3. For testing error handling:

   - Use expect().rejects.toThrow() for async functions
   - Use expect().toThrow() for synchronous functions
   - Verify error messages and types when appropriate

4. For MCP (Model Context Protocol) testing:
   - Mock external dependencies at the module level
   - Use proper import paths from the SDK (e.g., '@modelcontextprotocol/sdk/server/mcp.js')
   - Test both success and error paths for all operations

# Testing & Validation

1. Use 'npm test <path>' to run specific tests
2. Use the 'mtd' command directly for testing instead of 'node dist/index.js'
3. Chain commands when possible to reduce API calls (e.g., 'npm run build && mtd add')
4. Always verify test results before proceeding to the next step
5. Test both the happy path and error cases for new functionality
