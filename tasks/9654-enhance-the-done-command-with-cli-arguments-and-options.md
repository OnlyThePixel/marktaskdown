---
title: Enhance the done Command with CLI Arguments and Options
is_done: true
---

# Enhance the `done` Command with CLI Arguments and Options

## Objective

Modify the `src/ui/cli/commands/done.ts` command to accept arguments and options from the CLI, while maintaining the existing interactive selection functionality when no arguments are provided.

## Current Implementation

Currently, the `done` command:

- Lists all undone tasks in an interactive checkbox prompt
- Allows users to select which tasks to mark as done
- Does not accept any CLI arguments or options

## Requirements

1. **Add support for direct task completion via arguments:**

   - Allow users to specify task slugs as arguments to mark specific tasks as done
   - Example: `mtd done task-1 task-2` should mark tasks with slugs "task-1" and "task-2" as done

2. **Maintain backward compatibility:**

   - When no arguments or options are provided, continue to show the interactive checkbox prompt
   - Example: `mtd done` should work as it currently does

3. **Update the command registration:**

   - Modify the command registration in `src/ui/cli/index.ts` to include the new arguments and options
   - Update the command description to reflect the new functionality

4. **Update tests:**
   - Extend the test suite in `src/ui/cli/commands/done.test.ts` to cover the new functionality
   - Test both the argument-based and option-based task completion

## Success Criteria

- Users can mark tasks as done by providing slugs as arguments
- The interactive selection still works when no arguments are provided
- All tests pass, including new tests for the added functionality
- The command help text clearly explains the new arguments and options
