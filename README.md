# MarkTaskDown (mtd)

A lightweight CLI for managing tasks as Markdown files with YAML front-matter.

- **Text-native**: Store tasks as simple Markdown files
- **Offline-first**: No internet connection required
- **Git-friendly**: Track task changes with version control

## Installation

```bash
# Not yet published to npm
npm install -g marktaskdown
```

## Usage

### Initialize Task Directory

```bash
mtd init
```

Creates a `/tasks` folder in your current directory.

### Add a New Task

```bash
mtd add <title> [options]
```

Creates a new task with the specified title and optional description.

Options:

- `-d, --description <description>`: Add a description to the task

Example:

```bash
mtd add "Implement new feature" --description "Add the ability to mark tasks as done"
```

### List All Tasks

```bash
mtd list
```

Displays a table of all tasks with their status.

### Mark Tasks as Done

```bash
mtd done [slugs...]
```

When called without arguments, provides an interactive prompt to select and mark tasks as completed.

When called with task slugs as arguments, marks those specific tasks as done.

Example:

```bash
mtd done task-1 task-2
```

### Delete Tasks

```bash
mtd delete
```

Interactive prompt to select and archive tasks.

## Architecture

MarkTaskDown follows [Domain-Driven Design (DDD)](https://en.wikipedia.org/wiki/Domain-driven_design) principles with a clean architecture approach. For details on the architecture, see:

- [architecture-plan.md](architecture-plan.md) - Detailed architecture plan
- [docs/DEVELOPER.md](docs/DEVELOPER.md) - Developer documentation

## Development

This project follows Test-Driven Development (TDD) practices. See [docs/README.md](docs/README.md) for the detailed product requirements and [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## MCP Server

MarkTaskDown includes a Model Context Protocol (MCP) server that allows LLM applications to interact with your tasks.

### What is MCP?

The Model Context Protocol (MCP) is a standard that enables Large Language Models (LLMs) to interact with external tools and resources. With MarkTaskDown's MCP server, LLMs can manage your tasks directly.

### Starting the MCP Server

```bash
mtd mcp-server
```

This command starts the MCP server with STDIO transport, allowing LLM applications to interact with your tasks. The server will continue running until you press Ctrl+C.

### Available Tools and Resources

The MCP server provides the following tools:

- `initialize-project`: Initialize a new MarkTaskDown project
- `create-task`: Create a new task
- `set-task-done`: Mark a task as done
- `set-task-undone`: Mark a task as undone
- `delete-task`: Delete a task

And the following resources:

- `tasks://list`: Get a list of all tasks
- `tasks://{slug}`: Get details of a specific task

For more detailed information about the MCP server, see [docs/README.md](docs/README.md).

## License

MIT
