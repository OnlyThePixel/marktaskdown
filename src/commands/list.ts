import fs from "fs";
import path from "path";
import { render } from "ink";
import React from "react";
import { Table } from "../ui/Table.js";
import matter from "gray-matter";

interface TaskFrontMatter {
  title: string;
  is_done: boolean;
}

/**
 * Extract slug from filename
 */
function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

/**
 * List all tasks
 *
 * Reads all markdown files in the tasks directory and displays them in a table
 */
export function listCommand(): void {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  const tasksFiles = fs.readdirSync(tasksDir);

  const markdownFiles = tasksFiles.filter((filename) => {
    const filePath = path.join(tasksDir, filename);

    return fs.statSync(filePath).isFile() && filePath.endsWith(".md");
  });

  if (markdownFiles.length === 0) {
    console.log("📝 No tasks found.");

    return;
  }

  const tasks = markdownFiles
    .map((filename) => {
      const filePath = path.join(tasksDir, filename);

      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data } = matter(fileContent);
        const frontMatter = data as TaskFrontMatter; // TODO: Parse data to TaskFrontMatter

        if (!frontMatter.title) {
          console.warn(`⚠️ Warning: Could not parse task file: ${filename}`);

          return null;
        }

        return {
          slug: getSlugFromFilename(filename),
          title: frontMatter.title,
          status: frontMatter.is_done ? "DONE" : "PENDING",
        };
      } catch (error) {
        console.warn(`⚠️ Warning: Could not parse task file: ${filename}`);

        return null;
      }
    })
    .filter((task) => task !== null); // Remove null entries

  render(React.createElement(Table, { data: tasks }));
}
