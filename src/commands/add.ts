import fs from "fs";
import path from "path";

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
 */
export function addCommand(
  title: string,
  options: { description?: string }
): void {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  // Check if tasks directory exists
  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // Generate filename from title
  const slug = toSlug(title);
  const filename = `${slug}.md`;
  const filePath = path.join(tasksDir, filename);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`❌ Task with title "${title}" already exists.`);
    return;
  }

  // Create and write task content
  const content = createTaskContent(title, options.description);
  fs.writeFileSync(filePath, content);

  console.log(`✅ Created task: ${title}`);
  console.log(`📝 File: ${filename}`);
}
