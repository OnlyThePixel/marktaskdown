/**
 * CreateTaskDTO
 * Data Transfer Object for creating a new Task
 * Contains the data needed to create a task
 */
export interface CreateTaskDTO {
  /**
   * The title of the task
   */
  title: string;

  /**
   * The description of the task
   */
  description: string;

  /**
   * Optional ID to use for slug generation
   * If not provided, a random ID will be generated
   */
  id?: string;
}
