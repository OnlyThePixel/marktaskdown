/**
 * TaskDTO
 * Data Transfer Object for Task entity
 * Used for transferring task data between layers
 */
export interface TaskDTO {
  /**
   * The slug of the task (unique identifier)
   */
  slug: string;

  /**
   * The title of the task
   */
  title: string;

  /**
   * The description of the task
   */
  description: string;

  /**
   * Whether the task is done
   */
  isDone: boolean;
}
