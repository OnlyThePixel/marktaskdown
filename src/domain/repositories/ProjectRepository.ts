/**
 * Repository interface for project-related operations
 */
export interface ProjectRepository {
  /**
   * Initializes the project structure
   *
   * @returns Whether the tasks directory was created (true) or already existed (false)
   */
  initializeTasksDirectory(): Promise<boolean>;

  /**
   * Gets the path to the tasks directory
   *
   * @returns The absolute path to the tasks directory
   */
  getTasksDirectoryPath(): string;
}
