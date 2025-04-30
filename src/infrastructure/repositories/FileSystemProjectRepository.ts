import fs from "fs";
import path from "path";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository.js";

/**
 * File system implementation of the ProjectRepository
 */
export class FileSystemProjectRepository implements ProjectRepository {
  private readonly tasksDir: string;

  /**
   * Creates a new FileSystemProjectRepository
   *
   * @param tasksDir Optional custom path for the tasks directory
   */
  constructor(tasksDir?: string) {
    this.tasksDir = tasksDir || path.join(process.cwd(), "tasks");
  }

  /**
   * Initializes the tasks directory if it doesn't exist
   *
   * @returns Whether the tasks directory was created (true) or already existed (false)
   */
  async initializeTasksDirectory(): Promise<boolean> {
    const exists = fs.existsSync(this.tasksDir);

    if (!exists) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
      return true;
    }

    return false;
  }

  /**
   * Gets the path to the tasks directory
   *
   * @returns The absolute path to the tasks directory
   */
  getTasksDirectoryPath(): string {
    return this.tasksDir;
  }
}
