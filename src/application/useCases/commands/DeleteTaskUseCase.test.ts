import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteTaskUseCase } from "./DeleteTaskUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

describe("DeleteTaskUseCase", () => {
  let mockTaskRepository: TaskRepository;
  let deleteTaskUseCase: DeleteTaskUseCase;
  let task: Task;
  let taskSlug: Slug;

  beforeEach(() => {
    // Create a task
    task = new Task(
      new Title("Test Task"),
      new Description("Test Description"),
      false,
      "123"
    );

    taskSlug = task.slug;

    // Create mock repository
    mockTaskRepository = {
      findBySlug: vi.fn().mockResolvedValue(task),
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Create use case
    deleteTaskUseCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  it("should find the task by slug", async () => {
    // Execute the use case
    await deleteTaskUseCase.execute(taskSlug);

    // Verify that repository's findBySlug method was called with the correct slug
    expect(mockTaskRepository.findBySlug).toHaveBeenCalledWith(taskSlug);
  });

  it("should throw an error if the task is not found", async () => {
    // Setup repository to return null (task not found)
    mockTaskRepository.findBySlug = vi.fn().mockResolvedValue(null);

    // Execute the use case and expect it to throw
    await expect(deleteTaskUseCase.execute(taskSlug)).rejects.toThrow(
      "Task not found"
    );
  });

  it("should delete the task from the repository", async () => {
    // Execute the use case
    await deleteTaskUseCase.execute(taskSlug);

    // Verify that repository's delete method was called with the correct slug
    expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskSlug);
  });

  it("should return the deleted task", async () => {
    // Execute the use case
    const result = await deleteTaskUseCase.execute(taskSlug);

    // Verify the result is the deleted task
    expect(result).toBe(task);
  });
});
