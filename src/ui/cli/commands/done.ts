import fs from "fs";
import path from "path";
import { checkbox } from "@inquirer/prompts";
import { SetTaskAsDoneUseCase } from "../../../application/useCases/commands/SetTaskAsDoneUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { TaskPresenter } from "../../presenters/TaskPresenter.js";

/**
 * Mark tasks as done
 *
 * Lists all undone tasks and allows selecting which ones to mark as done
 * Uses SetTaskAsDoneUseCase to mark tasks as done
 */
export async function doneCommand(): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // Create repository and use case
  const taskRepository = new FileSystemTaskRepository(tasksDir);
  const setTaskAsDoneUseCase = new SetTaskAsDoneUseCase(taskRepository);

  // Get all tasks
  const tasks = await taskRepository.findAll();

  if (tasks.length === 0) {
    console.log("📝 No tasks found.");
    return;
  }

  // Filter for undone tasks
  const undoneTasks = tasks.filter((task) => !task.isDone);

  if (undoneTasks.length === 0) {
    console.log("📝 No undone tasks found.");
    return;
  }

  // Use TaskPresenter to format tasks for checkbox prompt
  const choices = TaskPresenter.toListItems(undoneTasks);

  // Prompt user to select tasks to mark as done
  const selectedSlugs = await checkbox({
    message: "Select tasks to mark as done",
    choices,
  });

  if (!selectedSlugs || selectedSlugs.length === 0) {
    console.log("❌ No tasks selected.");
    return;
  }

  // Mark selected tasks as done
  for (const slugValue of selectedSlugs) {
    try {
      // Find the task in the list of undone tasks
      const task = undoneTasks.find((task) => task.slug.value === slugValue);

      if (!task) {
        console.log(`❌ Task not found with slug: ${slugValue}`);
        continue;
      }

      // Execute use case to mark task as done
      await setTaskAsDoneUseCase.execute(task.slug);

      console.log(`✅ Marked task as done: ${task.title.value}`);
    } catch (error) {
      console.log(`❌ Error marking task as done: ${slugValue}`, error);
    }
  }
}
