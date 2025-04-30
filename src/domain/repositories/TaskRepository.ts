/**
 * TaskRepository interface
 * Defines the contract for persisting and retrieving tasks
 */
import { Task } from "../entities/Task.js";
import { Slug } from "../valueObjects/Slug.js";

export interface TaskRepository {
  /**
   * Saves a task to the repository
   * If a task with the same slug already exists, it will be updated
   *
   * @param task - The task to save
   */
  save(task: Task): Promise<void>;

  /**
   * Finds a task by its slug
   *
   * @param slug - The slug of the task to find
   * @returns The task if found, null otherwise
   */
  findBySlug(slug: Slug): Promise<Task | null>;

  /**
   * Retrieves all tasks from the repository
   *
   * @returns An array of all tasks
   */
  findAll(): Promise<Task[]>;

  /**
   * Deletes a task from the repository
   *
   * @param slug - The slug of the task to delete
   */
  delete(slug: Slug): Promise<void>;
}
