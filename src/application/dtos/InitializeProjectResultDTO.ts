/**
 * Data Transfer Object for the result of initializing the project
 */
export interface InitializeProjectResultDTO {
  /**
   * Whether the tasks directory was created (true) or already existed (false)
   */
  created: boolean;

  /**
   * Path to the tasks directory
   */
  tasksDir: string;
}
