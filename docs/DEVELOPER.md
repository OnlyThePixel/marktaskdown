# MarkTaskDown Developer Documentation

This document provides detailed information about the MarkTaskDown project architecture, development workflow, and testing approach for developers who want to contribute to or understand the project.

## Table of Contents

- [Project Architecture](#project-architecture)
  - [Domain Layer](#domain-layer)
  - [Application Layer](#application-layer)
  - [Infrastructure Layer](#infrastructure-layer)
  - [UI Layer](#ui-layer)
  - [MCP Layer](#mcp-layer)
- [Data Flow](#data-flow)
- [Testing Strategy](#testing-strategy)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [System Tests](#system-tests)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)

## Project Architecture

MarkTaskDown follows [Domain-Driven Design (DDD)](https://en.wikipedia.org/wiki/Domain-driven_design) principles with a [clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) approach. The codebase is organized into four distinct layers:

```mermaid
graph TD
    A[UI Layer] --> B[Application Layer]
    B --> C[Domain Layer]
    B --> D[Infrastructure Layer]
    D --> C

    subgraph "Domain Layer (Core)"
        C1[Entities]
        C2[Value Objects]
        C3[Repository Interfaces]
    end

    subgraph "Application Layer"
        B1[Use Cases]
        B2[DTOs]
    end

    subgraph "Infrastructure Layer"
        D1[Repositories]
        D2[File System Adapter]
        D3[MCP Server]
    end

    subgraph "UI Layer"
        A1[CLI Interface]
        A2[Presenters]
    end
```

### Domain Layer

The domain layer is the core of the application and contains the business logic. It is independent of any external concerns and defines the entities, value objects, and repository interfaces.

#### Entities

Entities are objects with an identity that persists over time:

- **Task**: The central entity representing a task with properties like title, description, and completion status.

#### Value Objects

Value objects are immutable objects that have no identity:

- **Slug**: Represents the unique identifier for a task
- **Title**: Represents the task title
- **Description**: Represents the task description

#### Repository Interfaces

Repository interfaces define the contract for data access:

- **TaskRepository**: Defines methods for persisting and retrieving tasks
- **ProjectRepository**: Defines methods for project-related operations

### Application Layer

The application layer orchestrates the [use cases](https://en.wikipedia.org/wiki/Use_case) by coordinating domain objects. It contains use cases (commands and queries) and DTOs.

#### Use Cases (Commands)

Command use cases modify the state of the system:

- **CreateTaskUseCase**: Creates a new task
- **SetTaskAsDoneUseCase**: Sets a task as done
- **SetTaskAsUndoneUseCase**: Sets a task as undone
- **DeleteTaskUseCase**: Deletes a task
- **InitializeProjectUseCase**: Initializes a new project

#### Use Cases (Queries)

Query use cases retrieve data from the system:

- **GetAllTasksUseCase**: Retrieves all tasks
- **GetTaskBySlugUseCase**: Retrieves a task by its slug

#### DTOs (Data Transfer Objects)

DTOs are used for transferring data between layers:

- **CreateTaskDTO**: Contains data needed to create a task
- **InitializeProjectResultDTO**: Contains the result of initializing a project

### Infrastructure Layer

The infrastructure layer provides implementations for interfaces defined in the domain layer. It contains repositories and adapters.

#### Repositories

Repository implementations handle data persistence:

- **FileSystemTaskRepository**: Implements TaskRepository using the file system
- **FileSystemProjectRepository**: Implements ProjectRepository using the file system

#### Adapters

Adapters handle external services or libraries:

- **MarkdownFileAdapter**: Handles reading/writing markdown files with YAML frontmatter
- **MCP Server**: Implements the Model Context Protocol server for LLM interaction

#### MCP Server

The MCP server provides an interface for LLM applications to interact with MarkTaskDown:

- **MarkTaskDownMcpServer**: Main server class that registers tools and resources
- **Tools**: Implementations of MCP tools for task management operations
- **Resources**: Implementations of MCP resources for retrieving task information

### UI Layer

The UI layer handles user interaction through different interfaces. It contains the CLI interface and MCP server command.

#### CLI Interface

The CLI interface is implemented using [Commander.js](https://github.com/tj/commander.js/):

- **Commands**: Implementations of CLI commands (add, list, done, delete, init, mcp-server)

#### Presenters

Presenters format domain entities for presentation:

- **TaskPresenter**: Formats Task entities for display

## Data Flow

The data flow in the application follows these patterns:

1. **Command Flow** (modifying data):

   ```mermaid
   graph LR
       A[UI Layer: Command] --> B[Application Layer: Use Case]
       B --> C[Domain Layer: Entities]
       C --> D[Infrastructure Layer: Repository]
   ```

2. **Query Flow** (retrieving data):

   ```mermaid
   graph LR
       A[UI Layer: Command] --> B[Application Layer: Use Case]
       B --> D[Infrastructure Layer: Repository]
       D --> C[Domain Layer: Entities]
       C --> E[UI Layer: Presenter]
   ```

3. **MCP Flow** (LLM interaction):
   ```mermaid
   graph LR
       A[LLM Application] --> B[Infrastructure Layer: MCP Server]
       B --> C[Application Layer: Use Case]
       C --> D[Domain Layer: Entities]
       D --> E[Infrastructure Layer: Repository]
       E --> F[LLM Application]
   ```

## Testing Strategy

MarkTaskDown follows a comprehensive testing strategy with different types of tests:

### Unit Tests

Unit tests verify the behavior of individual components in isolation:

- **Domain Layer Tests**: Test entities, value objects, and repository interfaces
- **Application Layer Tests**: Test use cases with mocked dependencies
- **Infrastructure Layer Tests**: Test repositories and adapters
- **UI Layer Tests**: Test presenters and command handlers
- **MCP Layer Tests**: Test MCP server, tools, and resources

### Integration Tests

Integration tests verify that different components work together correctly:

- **CLI Integration Tests**: Test the CLI commands with mocked dependencies
- **Repository Integration Tests**: Test repositories with actual file system

### System Tests

System tests verify the entire system working together:

- **End-to-End Tests**: Test the entire workflow from initialization to task deletion

## Development Workflow

MarkTaskDown follows the [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development) approach:

1. 🔴 **RED**: Write failing tests first that define the expected behavior
2. 🟢 **GREEN**: Implement the minimal code needed to make tests pass
3. ♻️ **REFACTOR**: Clean up the code while keeping tests passing

For new features or changes:

1. Create a new task using the `mtd add` command
2. Write tests for the new feature
3. Implement the feature
4. Run tests to ensure they pass
5. Mark the task as done using the `mtd done` command
6. Commit changes with the appropriate gitmoji prefix

## Project Structure

```
marktaskdown/
├── docs/                  # Documentation
├── src/                   # Source code
│   ├── domain/            # Domain layer
│   │   ├── entities/      # Domain entities
│   │   ├── valueObjects/  # Value objects
│   │   └── repositories/  # Repository interfaces
│   ├── application/       # Application layer
│   │   ├── useCases/      # Use cases (commands and queries)
│   │   └── dtos/          # Data Transfer Objects
│   ├── infrastructure/    # Infrastructure layer
│   │   ├── repositories/  # Repository implementations
│   │   ├── adapters/      # External service adapters
│   │   └── mcp/           # MCP server implementation
│   ├── ui/                # UI layer
│   │   ├── cli/           # CLI interface
│   │   └── presenters/    # Presenters for formatting output
│   └── tests/             # Integration and system tests
├── tasks/                 # Task files
└── package.json           # Project configuration
```

This structure follows the principles of Domain-Driven Design and Clean Architecture, with clear separation of concerns between layers.

## MCP Server Architecture

The MCP (Model Context Protocol) server allows LLM applications to interact with MarkTaskDown. It follows the same architectural principles as the rest of the application.

### MCP Server Components

```mermaid
graph TD
    A[MarkTaskDownMcpServer] --> B[McpServer]
    A --> C[StdioServerTransport]
    A --> D[Tools]
    A --> E[Resources]
    D --> F[Use Cases]
    E --> F
```

- **MarkTaskDownMcpServer**: The main server class that initializes the MCP server and registers tools and resources
- **McpServer**: The core MCP server from the SDK that handles protocol communication
- **StdioServerTransport**: The transport layer that handles communication via standard input/output
- **Tools**: Implementations of MCP tools that map to application use cases
- **Resources**: Implementations of MCP resources that provide access to task information

### Adding New Tools

To add a new tool to the MCP server:

1. Implement the necessary use case in the application layer
2. Register the tool in the `registerTools` method of `MarkTaskDownMcpServer`
3. Define the tool's parameters using Zod schema
4. Implement the tool's handler function to execute the use case and format the response

### Adding New Resources

To add a new resource to the MCP server:

1. Implement the necessary use case in the application layer
2. Register the resource in the `registerResources` method of `MarkTaskDownMcpServer`
3. Define the resource's URI pattern using a string or ResourceTemplate
4. Implement the resource's handler function to execute the use case and format the response
