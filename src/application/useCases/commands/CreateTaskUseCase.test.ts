import { describe, it, expect, beforeEach } from "vitest";
import { CreateTaskUseCase } from "./CreateTaskUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";
import { CreateTaskDTO } from "../../dtos/CreateTaskDTO.js";

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

  it("should use the provided ID for slug generation if available", async () => {
    // Arrange
    const createTaskDTO: CreateTaskDTO = {
      title: "Test Task",
      description: "This is a test task",
      id: "123",
    };

    // Act
    const result = await useCase.execute(createTaskDTO);

    // Assert
    expect(result.slug.value).toContain("123-");

    const savedTask = repository.getLastSavedTask();
    expect(savedTask?.slug.value).toContain("123-");
  });
});
