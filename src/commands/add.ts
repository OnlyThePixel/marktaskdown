import fs from "fs";
import path from "path";
import { input, confirm } from "@inquirer/prompts";

/**
 * Convert a string to a slug
 */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Create task content with YAML front-matter
 */
function createTaskContent(title: string, description?: string): string {
  const frontMatter = ["---", `title: ${title}`, "is_done: false", "---"].join(
    "\n"
  );

  const descriptionContent =
    description || "<!-- Add your task details here -->";

  return [frontMatter, "", descriptionContent, ""].join("\n");
}

/**
 * Add a new task
 *
 * Creates a new markdown file with YAML front-matter in the tasks directory
 * If no title is provided, enters interactive mode to prompt for title and description
 */
export async function addCommand(
  title?: string,
  options: { description?: string } = {}
): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // If no title provided, enter interactive mode
  if (!title) {
    console.log("📝 Interactive task creation mode");

    // Prompt for title with validation for existing files
    let slug = "";
    let filename = "";
    let filePath = "";
    let isValidTitle = false;

    while (!isValidTitle) {
      title = await input({
        message: "Enter task title:",
        validate: (value) => {
          if (!value.trim()) return "Title cannot be empty";
          return true;
        },
      });

      // Generate filename from title
      slug = toSlug(title);
      filename = `${slug}.md`;
      filePath = path.join(tasksDir, filename);

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        console.log(
          `⚠️ A task with a similar title already exists: ${filename}`
        );
        const retry = await confirm({
          message: "Would you like to enter a different title?",
          default: true,
        });

        if (!retry) {
          console.log("❌ Operation cancelled.");
          return;
        }
      } else {
        isValidTitle = true;
      }
    }

    // Prompt for description
    const description = await input({
      message: "Enter task description (optional):",
    });

    // If description is provided, use it
    if (description.trim()) {
      options.description = description;
    }
  } else {
    // Non-interactive mode - generate filename from title
    const slug = toSlug(title);
    const filename = `${slug}.md`;
    const filePath = path.join(tasksDir, filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`❌ Task with title "${title}" already exists.`);
      return;
    }
  }

  // Ensure title is defined at this point
  if (!title) {
    console.log("❌ Error: Task title is empty");
    return;
  }

  // Generate filename from title
  const slug = toSlug(title);
  const filename = `${slug}.md`;
  const filePath = path.join(tasksDir, filename);

  // Create and write task content
  const content = createTaskContent(title, options.description);
  fs.writeFileSync(filePath, content);

  console.log(`✅ Created task: ${title}`);
  console.log(`📝 File: ${filename}`);
}
