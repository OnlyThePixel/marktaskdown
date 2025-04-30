import { Task } from "../../../domain/entities/Task.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";

/**
 * GetAllTasksUseCase
 * Application use case for retrieving all tasks
 */
export class GetAllTasksUseCase {
  private readonly taskRepository: TaskRepository;

  /**
   * Creates a new GetAllTasksUseCase
   *
   * @param taskRepository - Repository for task persistence
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Executes the use case
   *
   * @returns An array of Task domain entities
   */
  async execute(): Promise<Task[]> {
    // Retrieve all tasks from the repository
    const tasks = await this.taskRepository.findAll();

    // Return the tasks directly
    return tasks;
  }
}
