import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { checkbox, confirm } from "@inquirer/prompts";

interface TaskFrontMatter {
  title: string;
  is_done: boolean;
}

interface TaskChoice {
  name: string;
  value: string;
  message: string;
}

/**
 * Delete tasks by moving them to archive
 *
 * Lists all tasks and allows selecting which ones to move to the archive directory
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

  const tasksFiles = fs.readdirSync(tasksDir);

  // Filter for markdown files
  const markdownFiles = tasksFiles.filter((filename) => {
    const filePath = path.join(tasksDir, filename);
    return fs.statSync(filePath).isFile() && filePath.endsWith(".md");
  });

  if (markdownFiles.length === 0) {
    console.log("📝 No tasks found.");
    return;
  }

  // Parse task files
  const allTasks: TaskChoice[] = [];

  for (const filename of markdownFiles) {
    const filePath = path.join(tasksDir, filename);

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContent);
      const frontMatter = data as TaskFrontMatter;

      if (!frontMatter.title) {
        console.warn(`⚠️ Warning: Could not parse task file: ${filename}`);
        continue;
      }

      // Include all tasks regardless of status
      allTasks.push({
        name: filename,
        value: filename,
        message: `${frontMatter.title} ${frontMatter.is_done ? "(DONE)" : "(PENDING)"}`,
      });
    } catch {
      console.warn(`⚠️ Warning: Could not parse task file: ${filename}`);
    }
  }

  if (allTasks.length === 0) {
    console.log("📝 No tasks found.");
    return;
  }

  // Prompt user to select tasks to delete
  const selectedTasks = await checkbox({
    message: "Select tasks to delete",
    choices: allTasks.map((task) => ({
      name: task.message,
      value: task.value,
    })),
  });

  if (!selectedTasks || selectedTasks.length === 0) {
    console.log("❌ No tasks selected.");
    return;
  }

  // Confirm deletion
  const confirmed = await confirm({
    message: `Are you sure you want to delete ${selectedTasks.length} task(s)?`,
    default: false,
  });

  if (!confirmed) {
    console.log("❌ Operation cancelled.");
    return;
  }

  // Move selected tasks to archive
  for (const filename of selectedTasks) {
    const sourcePath = path.join(tasksDir, filename);
    const destinationPath = path.join(archiveDir, filename);

    try {
      // Read the file content
      const fileContent = fs.readFileSync(sourcePath, "utf8");
      const parsedContent = matter(fileContent);
      const frontMatter = parsedContent.data as TaskFrontMatter;

      // Write the file to the archive directory
      fs.writeFileSync(destinationPath, fileContent);

      // Delete the original file
      fs.unlinkSync(sourcePath);

      console.log(`🗑️ Archived task: ${frontMatter.title}`);
    } catch (error) {
      console.warn(`⚠️ Error archiving task file: ${filename}`, error);
    }
  }
}
