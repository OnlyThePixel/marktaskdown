import { Task } from "../../../domain/entities/Task.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

/**
 * DeleteTaskUseCase
 * Application use case for deleting a task
 */
export class DeleteTaskUseCase {
  private readonly taskRepository: TaskRepository;

  /**
   * Creates a new DeleteTaskUseCase
   *
   * @param taskRepository - Repository for task persistence
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Executes the use case
   *
   * @param slug - The slug of the task to delete
   * @returns The deleted task
   * @throws Error if the task is not found
   */
  async execute(slug: Slug): Promise<Task> {
    // Find the task by slug
    const task = await this.taskRepository.findBySlug(slug);

    // Throw error if task not found
    if (!task) {
      throw new Error("Task not found");
    }

    // Delete the task
    await this.taskRepository.delete(slug);

    // Return the deleted task
    return task;
  }
}
