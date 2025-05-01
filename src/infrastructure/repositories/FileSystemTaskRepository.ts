import path from "path";
import { Task } from "../../domain/entities/Task.js";
import { Slug } from "../../domain/valueObjects/Slug.js";
import { Title } from "../../domain/valueObjects/Title.js";
import { Description } from "../../domain/valueObjects/Description.js";
import { TaskRepository } from "../../domain/repositories/TaskRepository.js";
import { MarkdownFileAdapter } from "../adapters/MarkdownFileAdapter.js";

interface TaskFrontMatter {
  title: string;
  is_done: boolean;
  [key: string]: unknown;
}

/**
 * FileSystemTaskRepository
 * Implements TaskRepository interface using the file system
 * Uses MarkdownFileAdapter for file operations
 */
export class FileSystemTaskRepository implements TaskRepository {
  private readonly tasksDir: string;
  private readonly fileAdapter: MarkdownFileAdapter;

  /**
   * Creates a new FileSystemTaskRepository
   *
   * @param tasksDir Absolute path to the directory where task files are
   * stored. If not provided, it will use the current working directory with "tasks" as the subdirectory.
   * @param fileAdapter MarkdownFileAdapter instance for file operations. If not provided, a new instance will be created.
   */
  constructor(tasksDir?: string, fileAdapter?: MarkdownFileAdapter) {
    this.tasksDir = tasksDir || path.join(process.cwd(), "tasks");
    this.fileAdapter = fileAdapter || new MarkdownFileAdapter();
  }

  /**
   * Saves a task to the repository
   * If a task with the same slug already exists, it will be updated
   *
   * @param task - The task to save
   */
  async save(task: Task): Promise<void> {
    const filename = `${task.slug.value}.md`;
    const filePath = path.join(this.tasksDir, filename);

    // Create front matter
    const frontMatter: TaskFrontMatter = {
      title: task.title.value,
      is_done: task.isDone,
    };

    // Get description as content
    const content = task.description.value;

    // Write to file using the adapter
    await this.fileAdapter.writeFile(filePath, content, frontMatter);
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

    try {
      // Read and parse file using the adapter
      const fileData = await this.fileAdapter.readFile(filePath);

      if (!fileData) {
        return null;
      }

      const frontMatter = fileData.frontMatter as TaskFrontMatter;
      const content = fileData.content;

      // Extract id from slug
      const id = slug.value.split("-").shift() || "";

      // Create and return Task entity
      const task = new Task(
        new Title(frontMatter.title),
        new Description(content),
        frontMatter.is_done,
        id
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
    const tasks: Task[] = [];

    // Get all markdown files in the tasks directory
    const filePaths = await this.fileAdapter.listFiles(this.tasksDir, ".md");

    // Process each file
    for (const filePath of filePaths) {
      try {
        // Read and parse file using the adapter
        const fileData = await this.fileAdapter.readFile(filePath);

        if (!fileData) {
          continue;
        }

        const frontMatter = fileData.frontMatter as TaskFrontMatter;
        const content = fileData.content;

        // Extract slug from filename
        const filename = path.basename(filePath);
        const slug = filename.replace(/\.md$/, "");
        const id = slug.split("-").shift() || "";

        // Create Task entity
        const task = new Task(
          new Title(frontMatter.title),
          new Description(content),
          frontMatter.is_done,
          id
        );

        tasks.push(task);
      } catch (err) {
        console.warn(
          `Could not parse task file: ${path.basename(filePath)}`,
          err
        );
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

    // Delete file using the adapter
    await this.fileAdapter.deleteFile(filePath);
  }
}
