import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Task } from "../../domain/entities/Task.js";
import { Slug } from "../../domain/valueObjects/Slug.js";
import { Title } from "../../domain/valueObjects/Title.js";
import { Description } from "../../domain/valueObjects/Description.js";
import { TaskRepository } from "../../domain/repositories/TaskRepository.js";

interface TaskFrontMatter {
  title: string;
  is_done: boolean;
}

/**
 * FileSystemTaskRepository
 * Implements TaskRepository interface using the file system
 */
export class FileSystemTaskRepository implements TaskRepository {
  private readonly tasksDir: string;

  /**
   * Creates a new FileSystemTaskRepository
   *
   * @param tasksDir Absolute path to the directory where task files are
   * stored. If not provided, it will use the current working directory with "tasks" as the subdirectory.
   */
  constructor(tasksDir?: string) {
    this.tasksDir = tasksDir || path.join(process.cwd(), "tasks");
  }

  /**
   * Saves a task to the repository
   * If a task with the same slug already exists, it will be updated
   *
   * @param task - The task to save
   */
  async save(task: Task): Promise<void> {
    // Ensure tasks directory exists
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }

    const filename = `${task.slug.value}.md`;
    const filePath = path.join(this.tasksDir, filename);

    // Create front matter
    const frontMatter: TaskFrontMatter = {
      title: task.title.value,
      is_done: task.isDone,
    };

    // Get description as content
    const content = task.description.value;

    // Create file content with YAML front matter
    const fileContent = matter.stringify(content, frontMatter);

    // Write to file
    fs.writeFileSync(filePath, fileContent);
  }

  /**
   * Finds a task by its slug
   *
   * @param slug - The slug of the task to find
   * @returns The task if found, null otherwise
   */
  async findBySlug(slug: Slug): Promise<Task | null> {
    const filename = `${slug.value}.md`;
    const filePath = path.join(this.tasksDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      // Read and parse file
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);
      const frontMatter = data as TaskFrontMatter; // TODO: Parse property types

      // Create and return Task entity
      const task = new Task(
        new Title(frontMatter.title),
        new Description(content),
        frontMatter.is_done,
        slug.value.split("-").at(0) // Use the first part of the slug as the ID
      );

      return task;
    } catch (error) {
      console.error(`Error reading task file: ${filename}`, error);

      return null;
    }
  }

  /**
   * Retrieves all tasks from the repository
   *
   * @returns An array of all tasks
   */
  async findAll(): Promise<Task[]> {
    // Check if tasks directory exists
    if (!fs.existsSync(this.tasksDir)) {
      return [];
    }

    const tasks: Task[] = [];
    const dirEntries: fs.Dirent[] = fs.readdirSync(this.tasksDir, {
      withFileTypes: true,
    });

    // Filter for markdown files
    const markdownFiles: fs.Dirent[] = dirEntries.filter(
      (dirEntry) => dirEntry.isFile() && dirEntry.name.endsWith(".md")
    );

    // Process each file
    for (const file of markdownFiles) {
      const filePath = path.join(file.parentPath, file.name);

      try {
        // Read and parse file
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContent);
        const frontMatter = data as TaskFrontMatter;

        // Extract slug from filename
        const slug = file.name.replace(/\.md$/, "");

        // Create Task entity
        const task = new Task(
          new Title(frontMatter.title),
          new Description(content),
          frontMatter.is_done,
          slug.split("-").at(0)
        );

        tasks.push(task);
      } catch (err) {
        console.warn(`Could not parse task file: ${file.name}`, err);
      }
    }

    return tasks;
  }

  /**
   * Deletes a task from the repository
   *
   * @param slug - The slug of the task to delete
   */
  async delete(slug: Slug): Promise<void> {
    const filename = `${slug.value}.md`;
    const filePath = path.join(this.tasksDir, filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete file
      fs.unlinkSync(filePath);
    }
    // If file doesn't exist, do nothing (as per interface contract)
  }
}
