import fs from "fs";
import path from "path";
import { checkbox, confirm } from "@inquirer/prompts";
import { DeleteTaskUseCase } from "../../../application/useCases/commands/DeleteTaskUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

/**
 * Delete tasks by moving them to archive
 *
 * Lists all tasks and allows selecting which ones to move to the archive directory
 * Uses DeleteTaskUseCase to delete tasks from the repository
 */
export async function deleteCommand(): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");
  const archiveDir = path.join(tasksDir, ".archive");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // Create archive directory if it doesn't exist
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // Create repository and use case
  const taskRepository = new FileSystemTaskRepository(tasksDir);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  // Get all tasks
  const tasks = await taskRepository.findAll();

  if (tasks.length === 0) {
    console.log("📝 No tasks found.");
    return;
  }

  // Prepare choices for the checkbox prompt
  const choices = tasks.map((task) => {
    return {
      name: `${task.title.value} ${task.isDone ? "(DONE)" : "(PENDING)"}`,
      value: task.slug.value,
      message: `${task.title.value} ${task.isDone ? "(DONE)" : "(PENDING)"}`,
    };
  });

  // Prompt user to select tasks to delete
  const selectedSlugs = await checkbox({
    message: "Select tasks to delete",
    choices: choices.map((choice) => ({
      name: choice.message,
      value: choice.value,
    })),
  });

  if (!selectedSlugs || selectedSlugs.length === 0) {
    console.log("❌ No tasks selected.");
    return;
  }

  // Confirm deletion
  const confirmed = await confirm({
    message: `Are you sure you want to delete ${selectedSlugs.length} task(s)?`,
    default: false,
  });

  if (!confirmed) {
    console.log("❌ Operation cancelled.");
    return;
  }

  // Process selected tasks
  for (const slugValue of selectedSlugs) {
    try {
      // Create slug value object
      const slug = new Slug(slugValue);

      // Archive the task file before deleting it
      await archiveTask(tasksDir, archiveDir, slugValue);

      // Delete the task using the use case
      const deletedTask = await deleteTaskUseCase.execute(slug);

      console.log(`🗑️ Archived task: ${deletedTask.title.value}`);
    } catch (error) {
      console.warn(`⚠️ Error deleting task: ${slugValue}`, error);
    }
  }
}

/**
 * Archives a task file by copying it to the archive directory
 *
 * @param tasksDir - The directory containing task files
 * @param archiveDir - The archive directory
 * @param slugValue - The slug value of the task to archive
 */
async function archiveTask(
  tasksDir: string,
  archiveDir: string,
  slugValue: string
): Promise<void> {
  const filename = `${slugValue}.md`;
  const sourcePath = path.join(tasksDir, filename);
  const destinationPath = path.join(archiveDir, filename);

  try {
    // Read the file content
    const fileContent = fs.readFileSync(sourcePath, "utf8");

    // Write the file to the archive directory
    fs.writeFileSync(destinationPath, fileContent);
  } catch (error) {
    console.warn(`⚠️ Error archiving task file: ${filename}`, error);
    throw error;
  }
}
