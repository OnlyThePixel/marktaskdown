import { Task } from "../../../domain/entities/Task.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";

/**
 * GetTaskBySlugUseCase
 * Application use case for retrieving a task by its slug
 */
export class GetTaskBySlugUseCase {
  private readonly taskRepository: TaskRepository;

  /**
   * Creates a new GetTaskBySlugUseCase
   *
   * @param taskRepository - Repository for task persistence
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Executes the use case
   *
   * @param slug - The slug of the task to retrieve
   * @returns The Task domain entity if found, null otherwise
   */
  async execute(slug: Slug): Promise<Task | null> {
    // Retrieve the task from the repository
    const task = await this.taskRepository.findBySlug(slug);

    // Return the task (or null if not found)
    return task;
  }
}
