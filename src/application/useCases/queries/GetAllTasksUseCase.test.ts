import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllTasksUseCase } from "./GetAllTasksUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";

describe("GetAllTasksUseCase", () => {
  let mockTaskRepository: TaskRepository;
  let getAllTasksUseCase: GetAllTasksUseCase;
  let tasks: Task[];

  beforeEach(() => {
    // Create mock tasks
    const task1 = new Task(
      new Title("Task 1"),
      new Description("Description 1"),
      false,
      "1"
    );

    const task2 = new Task(
      new Title("Task 2"),
      new Description("Description 2"),
      true,
      "2"
    );

    tasks = [task1, task2];

    // Create mock repository
    mockTaskRepository = {
      findAll: vi.fn().mockResolvedValue(tasks),
      findBySlug: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    // Create use case
    getAllTasksUseCase = new GetAllTasksUseCase(mockTaskRepository);
  });

  it("should retrieve all tasks from the repository", async () => {
    // Execute the use case
    await getAllTasksUseCase.execute();

    // Verify that repository's findAll method was called
    expect(mockTaskRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("should return an array of Task domain entities", async () => {
    // Execute the use case
    const result = await getAllTasksUseCase.execute();

    // Verify the result is an array of Task entities
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    // Verify each item is a Task instance
    expect(result[0]).toBeInstanceOf(Task);
    expect(result[1]).toBeInstanceOf(Task);

    // Verify the tasks have the correct properties
    expect(result[0].slug.value).toBe(tasks[0].slug.value);
    expect(result[0].title.value).toBe(tasks[0].title.value);
    expect(result[0].description.value).toBe(tasks[0].description.value);
    expect(result[0].isDone).toBe(tasks[0].isDone);

    expect(result[1].slug.value).toBe(tasks[1].slug.value);
    expect(result[1].title.value).toBe(tasks[1].title.value);
    expect(result[1].description.value).toBe(tasks[1].description.value);
    expect(result[1].isDone).toBe(tasks[1].isDone);
  });
});
