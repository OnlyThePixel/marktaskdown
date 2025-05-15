---
sidebar_position: 1
---

# Introduction to MarkTaskDown

MarkTaskDown (`mtd`) is a lightweight tool for managing tasks as Markdown files with YAML front-matter.

## Key Features

- **Text-native**: All tasks are stored as plain Markdown files with YAML front-matter
- **Offline-first**: Works completely offline, no internet connection required
- **Git-friendly**: Easy to track changes and collaborate with others

## Getting Started

To get started with MarkTaskDown, follow these steps:

1. Initialize a new project:

   ```bash
   mtd init
   ```

2. Add a new task:

   ```bash
   mtd add
   ```

3. List all tasks:

   ```bash
   mtd list
   ```

4. Mark tasks as done:

   ```bash
   mtd done
   ```

5. Delete tasks:
   ```bash
   mtd delete
   ```

For more detailed information, check out the [documentation](./README.md).

## MCP Server

MarkTaskDown includes a Model Context Protocol (MCP) server that allows LLM applications to interact with your tasks:

```bash
mtd mcp-server
```

This enables AI assistants to manage your tasks directly through a standardized interface.
