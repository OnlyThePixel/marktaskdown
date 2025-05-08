---
title: "Implement MVP: Incremental Task ID Generation"
is_done: true
---

Implement the Minimum Viable Product (MVP) for incremental task ID generation.

Functional Requirements:

1.  **New Task ID Assignment:**

    - When a new task is created, the system shall automatically assign it a numerical ID.
    - This ID shall be determined by finding the highest numerical ID among all existing tasks within the current project and adding one (1) to it.
    - If no tasks currently exist in the project, the ID assigned to the new task shall be .
    - This generated numerical ID shall be used as the prefix for the task's slug and its corresponding filename.

2.  **Task Creation Input Modification:**

    - The necessary input for creating a new task shall be its and .
    - The interface (in `src/application/dtos/CreateTaskDTO.ts`) shall be modified to remove its optional `id` property.

3.  **Scope of Change:**

    - This ID generation logic applies exclusively to _newly created_ tasks.
    - Existing tasks and their current IDs will not be altered or affected by this change.

4.  **Explicitly Out of Scope for this MVP:**
    - Any system for persistently storing or tracking the next available ID (e.g., in a configuration file).
    - Any changes to how users interact with or reference task IDs in CLI commands.
    - Any utility or feature for migrating or re-assigning IDs to existing tasks.
