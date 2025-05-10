---
title: Fix task duplication bug in 'done' command
is_done: true
---

When marking a task as done, if the task filename differs from its title-based slug, the system creates a duplicate file instead of updating the original file. This happens because the 'done' command generates a new slug based on the title, which may differ from the original file's slug.

Steps to reproduce:

1. Create a task with a filename that doesn't match the slug that would be generated from its title
2. Run 'mtd done' on that task
3. Observe that a new file is created with the title-based slug, while the original file remains unchanged

Fix should ensure that the original task file is updated rather than creating a duplicate file.
