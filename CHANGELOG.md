# Changelog

All notable changes to this project will be documented in this file.

# 1.0.2 (2025-05-15)

## 🔧 Configuration

- `8076994` Fix GitHub release configuration by removing duplicate assets

## 🚚 Chores

- `7138937` Merge branch 'main' of https://github.com/OnlyThePixel/marktaskdown into main

# 1.0.1 (2025-05-15)

## 📝 Documentation

- `5d3c4f5` Set up Docusaurus in the docs directory

## 🔧 Configuration

- `ceae75f` Fix GitHub release assets configuration and update pre-commit hook

## 🚚 Chores

- `6da028b` Add tasks to implement project website

# 1.0.0 (2025-05-12)

## ✨ Features

- `3eaa5b2` Enhance parameter schemas for task-related tools in MCP server
- `e9758ca` Add MCP server command to CLI
- `f12235c` Implement Create Task MCP endpoint
- `787e387` Implement initialize project endpoint for MCP server
- `ee661b4` Implement initial MCP server setup
- `696d68a` Enhance done command with CLI arguments and options
- `8bd0960` Increase description content size limit from 1000 to 5000 characters
- `8aca077` feat: Implement TaskPresenter for formatting task data
- `9317e6a` Implement Description value object
- `e4b1bcf` Implement Title value object
- `0a721f3` Implement Slug value object
- `92924e9` Implement Task entity
- `d66ccc7` Add interactive mode to add command
- `f4b5142` Implement delete command
- `8bbc3c8` Add done command to mark tasks as completed
- `b1af0f5` Add list command
- `f86bca9` Add task command implementation
- `4489a6c` Add init command
- `ad90e3f` Add initial CLI implementation with welcome message

## 🐛 Bug Fixes

- `7c94456` Fix task duplication bug in 'done' command
- `a2f2d60` Fix type error in InitializeProjectUseCase test mock
- `52d7aeb` Fix YAML front matter string quoting in done command
- `d4a9dac` Fix YAML front-matter bug in add command
- `b09022d` Fix TypeScript errors in add command tests

## ♻️ Refactoring

- `177e970` Refactor delete command to use DeleteTaskUseCase
- `1a1623d` refactor: done command to use SetTaskAsDoneUseCase
- `d99884c` Refactor list command to use GetAllTasksUseCase
- `c41847f` Refactor add command to use application layer
- `7966947` Refactor init command to follow DDD architecture
- `a802ae4` Refactor init command to use application layer
- `0d08f23` Refactor FileSystemTaskRepository to use MarkdownFileAdapter
- `7f86eed` Replace enquirer with @inquirer/prompts

## 📝 Documentation

- `8faf2c3` Add NPM publishing guide and update package.json for publishing configuration
- `01ab9ff` Mark changelog generation task as done
- `b15c55c` Add release process task files
- `ec758eb` Archive done tasks
- `a6b778c` Update documentation with MCP server information
- `d680ecc` Update task files after completing MCP server infrastructure
- `d4a0983` Add tasks to implement an mcp server interface
- `6932683` Add task for fixing duplication bug in 'done' command
- `9a99fa4` add tasks to implement an mcp protocol
- `d8c9c55` Archive done tasks
- `27c869b` Add task to increase description content size limit
- `bfa01c6` Update project documentation to reflect new architecture
- `c43a525` add a task to iterate over the done command
- `d00e7af` Archive completed task files
- `684de13` Mark 'Task 1.2: Implement Slug Value Object' task as done
- `986e865` add architecture change plan and its tasks
- `6775c36` Update project documentation with ESLint config, gitmoji, and DDD approach

## 🔧 Configuration

- `076de76` Update package.json and GitHub workflow for first release
- `638dae0` Set up GitHub release creation with proper tagging
- `073fc57` Add custom release notes generator for changelog
- `143da54` Add custom release notes generator for changelog
- `e035b59` Update Roo Code mtd MCP server config and enable it
- `1fd74e2` Update pre-commit hook to apply prettier formatting and only stage previously staged files
- `5d86479` Add initial Roo Code's MCP server configuration for marktaskdown
- `1864e6b` Add commit hooks to lint, test and build before commit
- `d5afc9b` update .roomodes mtd-code prompt to remember to commit
- `4a56c66` add mtd-product custom mode to .roomodes
- `b139206` update .roomodes prompt to improve responses
- `3500966` Improve mtd-code mode instructions
- `e470afb` Update .roomodes to reference documentation files
- `6e9f0b5` Add Prettier and integrate with ESLint
- `45efebd` Update development guidelines in .roomodes
- `3d4668f` Add JSX support to tsconfig.json
- `436a4dd` Update development guidelines in mode configuration
- `449eb05` Update custom mode instructions with project guidelines
- `c74e716` Update package.json with bin field and build scripts
- `9a06fbf` Add tsup build configuration
- `55d98ba` Add TypeScript configuration

## ⬆️ Dependencies

- `6065e80` Add @semantic-release/github dependency
- `de70051` Add semantic release dependencies for automated versioning and changelog generation
- `609c4a3` Add zod dependency for improved data validation
- `1f91e27` Add express and @types/express dependencies
- `e9459df` Add @modelcontextprotocol/sdk dependency
- `7203a53` Remove ink-table dependency
- `9c4f4b8` Add ink, ink-table, react, and gray-matter dependencies
- `7d2a61e` Add vitest for testing
- `63feaba` Add commander, typescript and tsup dependencies

## 🧪 Tests

- `7c1ae54` Add integration tests for CLI commands
- `e3d1644` Mark 'Implement commit hooks' task as done

## 🚚 Chores

- `4ccb703` Add GitHub Actions workflow for automated releases
- `efbdf70` Override Roo Code orchestrator mode
- `3575659` Implement task detail resource for MCP server
- `0208f0e` Implement tasks://list resource for MCP server
- `1804008` Implement delete-task tool for MCP server
- `1955a34` Implement set-task-done and set-task-undone tools for MCP server
- `bc4afb4` Implement create-task tool for MCP server
- `1f50a5e` Implement initialize-project tool for MCP server
- `4eb309d` Improve mtd-code prompt
- `c5d5c11` Create MCP server infrastructure with STDIO transport
- `a34ae3f` Remove MCPServer implementation and related integration tests
- `e7205f8` Improve mtd-product prompt
- `482dc38` Implement incremental task ID generation
- `f148a7c` Improve mtd-code prompt
- `9d22745` Implement GetTaskBySlugUseCase
- `ca0ccd5` Implement DeleteTaskUseCase
- `8813d19` Implement SetTaskAsUndoneUseCase
- `962cd66` Implement SetTaskAsDoneUseCase
- `05e3875` Improve mtd-code prompt
- `8d72080` Implement GetAllTasksUseCase
- `f458e5e` Implement CreateTaskUseCase with DTOs and tests
- `48459d8` Implement MarkdownFileAdapter for reading/writing markdown files with YAML frontmatter
- `5bce985` Improve mtd-code prompt
- `6b783df` Implement FileSystemTaskRepository
- `dbd7299` Improve mtd-code prompt
- `ba6b2ac` Define TaskRepository interface and tests
- `87eec0a` Add ESLint with TypeScript and React support
- `1cc8569` Initial project setup
