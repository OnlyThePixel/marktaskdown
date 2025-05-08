import { describe, it, expect, beforeEach } from "vitest";
import { CreateTaskUseCase } from "./CreateTaskUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";
import { CreateTaskDTO } from "../../dtos/CreateTaskDTO.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";

// Mock implementation of TaskRepository for testing
class MockTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  async save(task: Task): Promise<void> {
    // Store the task in memory
    this.tasks.push(task);
  }

  async findBySlug(slug: Slug): Promise<Task | null> {
    const task = this.tasks.find((task) => task.slug.value === slug.value);
    return task || null;
  }

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  async delete(slug: Slug): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.slug.value !== slug.value);
  }

  // Helper method for testing
  getLastSavedTask(): Task | undefined {
    return this.tasks[this.tasks.length - 1];
  }
}

describe("CreateTaskUseCase", () => {
  let repository: MockTaskRepository;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    // Create a fresh repository and use case for each test
    repository = new MockTaskRepository();
    useCase = new CreateTaskUseCase(repository);
  });

  it("should create a task with the provided data", async () => {
    // Arrange
    const createTaskDTO: CreateTaskDTO = {
      title: "Test Task",
      description: "This is a test task",
    };

    // Act
    const result = await useCase.execute(createTaskDTO);

    // Assert
    expect(result).toBeInstanceOf(Task);
    expect(result.title.value).toBe(createTaskDTO.title);
    expect(result.description.value).toBe(createTaskDTO.description);
    expect(result.isDone).toBe(false);
    expect(result.slug).toBeDefined();
  });

  it("should save the created task to the repository", async () => {
    // Arrange
    const createTaskDTO: CreateTaskDTO = {
      title: "Test Task",
      description: "This is a test task",
    };

    // Act
    await useCase.execute(createTaskDTO);

    // Assert
    const savedTask = repository.getLastSavedTask();
    expect(savedTask).toBeDefined();
    expect(savedTask?.title.value).toBe(createTaskDTO.title);
    expect(savedTask?.description.value).toBe(createTaskDTO.description);
    expect(savedTask?.isDone).toBe(false);
  });

  it("should generate ID 1 for the first task when no tasks exist", async () => {
    // Arrange
    const createTaskDTO: CreateTaskDTO = {
      title: "First Task",
      description: "This is the first task",
    };

    // Act
    const result = await useCase.execute(createTaskDTO);

    // Assert
    expect(result.id).toBe("1");
    expect(result.slug.value.startsWith("1-")).toBe(true);
  });

  it("should generate incremental ID based on highest existing task ID", async () => {
    // Arrange - Add existing tasks with specific IDs
    await repository.save(
      new Task(
        new Title("Existing Task 1"),
        new Description("Description 1"),
        false,
        "5"
      )
    );
    await repository.save(
      new Task(
        new Title("Existing Task 2"),
        new Description("Description 2"),
        false,
        "10"
      )
    );
    await repository.save(
      new Task(
        new Title("Existing Task 3"),
        new Description("Description 3"),
        false,
        "3"
      )
    );

    const createTaskDTO: CreateTaskDTO = {
      title: "New Task",
      description: "This is a new task",
    };

    // Act
    const result = await useCase.execute(createTaskDTO);

    // Assert
    expect(result.id).toBe("11"); // Should be highest (10) + 1
    expect(result.slug.value.startsWith("11-")).toBe(true);
  });
});
