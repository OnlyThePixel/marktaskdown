import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { CreateTaskDTO } from "../../dtos/CreateTaskDTO.js";

/**
 * CreateTaskUseCase
 * Application use case for creating a new task
 */
export class CreateTaskUseCase {
  private readonly taskRepository: TaskRepository;

  /**
   * Creates a new CreateTaskUseCase
   *
   * @param taskRepository - Repository for task persistence
   */
  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Executes the use case
   *
   * @param createTaskDTO - Data needed to create a task
   * @returns The created task
   */
  async execute(createTaskDTO: CreateTaskDTO): Promise<Task> {
    // Create value objects from DTO
    const title = new Title(createTaskDTO.title);
    const description = new Description(createTaskDTO.description);

    // Create task entity
    const task = new Task(
      title,
      description,
      false, // New tasks are not done by default
      createTaskDTO.id
    );

    // Save task to repository
    await this.taskRepository.save(task);

    // Return the created task
    return task;
  }
}
