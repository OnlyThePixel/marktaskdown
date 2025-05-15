# Contributing to MarkTaskDown

Thank you for considering contributing to MarkTaskDown! This document provides guidelines and instructions for contributing to the project.

## Development Environment Setup

1. **Prerequisites**

   - Node.js 22 LTS
   - npm

2. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd marktaskdown
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Link the CLI for local development**
   ```bash
   npm link
   ```

## Architecture Overview

MarkTaskDown follows Domain-Driven Design (DDD) principles with a clean architecture approach. The codebase is organized into the following layers:

### Domain Layer

The domain layer contains the core business logic and is independent of any external concerns:

- **Entities**: Core business objects (e.g., `Task`)
- **Value Objects**: Immutable objects with no identity (e.g., `Slug`, `Title`, `Description`)
- **Repository Interfaces**: Contracts for data access (e.g., `TaskRepository`)

### Application Layer

The application layer orchestrates the use cases by coordinating domain objects:

- **Use Cases (Commands)**: Actions that modify state (e.g., `CreateTaskUseCase`, `SetTaskAsDoneUseCase`)
- **Use Cases (Queries)**: Actions that retrieve data (e.g., `GetAllTasksUseCase`, `GetTaskBySlugUseCase`)
- **DTOs**: Data Transfer Objects for passing data between layers

### Infrastructure Layer

The infrastructure layer provides implementations for interfaces defined in the domain layer:

- **Repositories**: Concrete implementations of repository interfaces (e.g., `FileSystemTaskRepository`)
- **Adapters**: Adapters for external services or libraries (e.g., `MarkdownFileAdapter`)

### UI Layer

The UI layer handles user interaction through different interfaces:

- **CLI Commands**: Implementations of CLI commands using Commander.js
- **Presenters**: Format data for output

## Development Workflow

### Test-Driven Development (TDD)

We follow the Red-Green-Refactor TDD workflow:

1. **RED**: Write failing tests first that define the expected behavior
2. **GREEN**: Implement the minimal code needed to make tests pass
3. **REFACTOR**: Clean up the code while keeping tests passing

### Running Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test src/domain/entities/Task.test.ts

# Run tests with coverage
npm run test:coverage
```

### Building the Project

```bash
npm run build
```

### Running the CLI

```bash
# Using the linked CLI
mtd <command>

# Directly from the source
node dist/cli.js <command>
```

## Git Workflow

1. **Commit Messages**
   We use [Gitmoji](https://gitmoji.dev/) for commit messages. Please follow the format in the [`.gitmessage`](../.gitmessage) file.

   Common gitmojis:

   - ✨ (sparkles): ONLY for end-user visible features
   - 👔 (necktie): For business logic implementation (use cases, domain logic)
   - ♻️ (recycle): For code refactoring
   - 🐛 (bug): For bug fixes
   - ✅ (white_check_mark): For adding or updating tests
   - 🏗️ (building_construction): For architectural changes

2. **Pull Requests**
   - Create a pull request with a clear description of the changes
   - Ensure all tests pass
   - Follow the project's code style and architecture

## Code Style and Quality

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Run linters
npm run lint

# Fix linting issues
npm run lint:fix
```

## Documentation

Please update documentation when making changes:

- Update README.md for user-facing changes
- Update code comments for implementation details
- Update architecture-plan.md for architectural changes

## License

By contributing to MarkTaskDown, you agree that your contributions will be licensed under the project's MIT license.
