import { Task } from "../../../domain/entities/Task.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

/**
 * SetTaskAsUndoneUseCase
 * Application use case for marking a task as undone
 */
export class SetTaskAsUndoneUseCase {
  private readonly taskRepository: TaskRepository;

  /**
   * Creates a new SetTaskAsUndoneUseCase
   *
   * @param taskRepository - Repository for task persistence
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Executes the use case
   *
   * @param slug - The slug of the task to mark as undone
   * @returns The updated task
   * @throws Error if the task is not found
   */
  async execute(slug: Slug): Promise<Task> {
    // Find the task by slug
    const task = await this.taskRepository.findBySlug(slug);

    // Throw error if task not found
    if (!task) {
      throw new Error("Task not found");
    }

    // Set the task as undone
    task.setAsUndone();

    // Save the updated task
    await this.taskRepository.save(task);

    // Return the updated task
    return task;
  }
}
