import fs from "fs";
import path from "path";

/**
 * Initialize the tasks directory
 *
 * Creates a tasks directory in the current working directory
 */
export function initCommand(): void {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
    console.log("✅ Created tasks directory");
  } else {
    console.log("✅ Tasks directory already exists");
  }

  console.log(
    '🚀 Initialization complete! You can now add tasks with "mtd add"'
  );
}
