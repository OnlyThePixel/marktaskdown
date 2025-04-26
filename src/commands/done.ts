import fs from "fs";
import path from "path";
import matter from "gray-matter";
import enquirer from "enquirer";
const { prompt } = enquirer;

interface TaskFrontMatter {
  title: string;
  is_done: boolean;
}

interface TaskChoice {
  name: string;
  value: string;
  message: string;
}

interface TaskPromptResult {
  selectedTasks: string[];
}

/**
 * Mark tasks as done
 *
 * Lists all undone tasks and allows selecting which ones to mark as done
 */
export async function doneCommand(): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
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

  // Parse task files and filter for undone tasks
  const undoneTasks: TaskChoice[] = [];

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

      // Only include undone tasks
      if (frontMatter.is_done === false) {
        undoneTasks.push({
          name: filename,
          value: filename,
          message: frontMatter.title,
        });
      }
    } catch {
      console.warn(`⚠️ Warning: Could not parse task file: ${filename}`);
    }
  }

  if (undoneTasks.length === 0) {
    console.log("📝 No undone tasks found.");
    return;
  }

  // Prompt user to select tasks to mark as done
  const result = await prompt<TaskPromptResult>({
    type: "multiselect",
    name: "selectedTasks",
    message: "Select tasks to mark as done",
    choices: undoneTasks,
  });

  if (!result.selectedTasks || result.selectedTasks.length === 0) {
    console.log("❌ No tasks selected.");
    return;
  }

  // Mark selected tasks as done
  for (const filename of result.selectedTasks) {
    const filePath = path.join(tasksDir, filename);

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const parsedContent = matter(fileContent);
      const frontMatter = parsedContent.data as TaskFrontMatter; // TODO: Parse data to TaskFrontMatter

      // Update is_done to true
      frontMatter.is_done = true;

      // Write updated content back to file
      const updatedContent = matter.stringify(
        parsedContent.content,
        frontMatter
      );
      fs.writeFileSync(filePath, updatedContent);

      console.log(`✅ Marked task as done: ${frontMatter.title}`);
    } catch {
      console.warn(`⚠️ Error updating task file: ${filename}`);
    }
  }
}
