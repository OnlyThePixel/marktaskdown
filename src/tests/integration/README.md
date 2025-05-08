# Integration Tests

This directory contains integration tests for the MarkTaskDown CLI tool. These tests verify that the entire system works together with the new architecture.

## Test Files

### cli.test.ts

This file contains integration tests that focus on testing the CLI commands by mocking dependencies. These tests verify that:

- The commands interact correctly with the use cases
- The commands handle user input properly
- The commands produce the expected output

These tests are more focused on the integration between the UI layer and the application layer.

### system.test.ts

This file contains end-to-end system tests that test the entire system working together. These tests:

- Create a temporary directory for testing
- Execute the actual CLI commands in a sequence that simulates real usage
- Verify the file system changes
- Test the entire workflow from initialization to task deletion

These tests are more comprehensive and test the entire system from the UI layer down to the infrastructure layer.

## Running the Tests

To run the integration tests, use the following command:

```bash
npm test src/tests/integration
```

To run a specific test file:

```bash
npm test src/tests/integration/cli.test.ts
# or
npm test src/tests/integration/system.test.ts
```
