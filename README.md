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
mtd done
```

Interactive prompt to select and mark tasks as completed.

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

## License

MIT
