import fs from "fs";
import path from "path";
import { input } from "@inquirer/prompts";
import { CreateTaskUseCase } from "../../../application/useCases/commands/CreateTaskUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { CreateTaskDTO } from "../../../application/dtos/CreateTaskDTO.js";

/**
 * Add a new task
 *
 * Creates a new markdown file with YAML front-matter in the tasks directory
 * If no title is provided, enters interactive mode to prompt for title and description
 */
export async function addCommand(
  title?: string,
  { description = "" }: { description?: string } = {}
): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // Create repository and use case
  const taskRepository = new FileSystemTaskRepository(tasksDir);
  const createTaskUseCase = new CreateTaskUseCase(taskRepository);

  // If no title provided, enter interactive mode
  if (!title) {
    // Prompt for title
    title = await input({
      message: "Enter task title:",
      validate: (value) => {
        if (!value.trim()) return "Title cannot be empty";

        return true;
      },
    });

    // Prompt for description
    description = await input({
      message: "Enter task description (optional):",
    });

    description = description.trim();
  }

  try {
    const createTaskDTO: CreateTaskDTO = {
      title,
      description,
    };
    const task = await createTaskUseCase.execute(createTaskDTO);

    console.log(`✅ Created task: ${task.title.value}`);
    console.log(`📝 File: ${task.slug.value}.md`);
  } catch (error) {
    console.log(error);
    return;
  }
}
