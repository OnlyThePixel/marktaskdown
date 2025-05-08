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

    // Generate incremental ID based on existing tasks
    const taskId = await this.generateIncrementalId();

    // Create task entity
    const task = new Task(
      title,
      description,
      false, // New tasks are not done by default
      taskId
    );

    // Save task to repository
    await this.taskRepository.save(task);

    // Return the created task
    return task;
  }

  /**
   * Generates an incremental ID for a new task
   * Finds the highest numerical ID among existing tasks and adds 1
   * If no tasks exist, returns "1"
   *
   * @returns A string containing the incremental ID
   * @private
   */
  private async generateIncrementalId(): Promise<string> {
    // Get all existing tasks
    const tasks = await this.taskRepository.findAll();

    if (tasks.length === 0) {
      return "1"; // Start with ID 1 if no tasks exist
    }

    // Extract numerical IDs from tasks
    const numericIds = tasks
      .map((task) => parseInt(task.id, 10))
      .filter((id) => !isNaN(id)); // Filter out non-numeric IDs

    if (numericIds.length === 0) {
      return "1"; // Start with ID 1 if no numeric IDs exist
    }

    // Find the highest ID and add 1
    const highestId = Math.max(...numericIds);
    return (highestId + 1).toString();
  }
}
