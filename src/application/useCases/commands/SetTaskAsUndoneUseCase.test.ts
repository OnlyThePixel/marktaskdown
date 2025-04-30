import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetTaskAsUndoneUseCase } from "./SetTaskAsUndoneUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

describe("SetTaskAsUndoneUseCase", () => {
  let mockTaskRepository: TaskRepository;
  let setTaskAsUndoneUseCase: SetTaskAsUndoneUseCase;
  let task: Task;
  let taskSlug: Slug;

  beforeEach(() => {
    // Create a task that is initially done
    task = new Task(
      new Title("Test Task"),
      new Description("Test Description"),
      true, // Done initially
      "123"
    );

    taskSlug = task.slug;

    // Create mock repository
    mockTaskRepository = {
      findBySlug: vi.fn().mockResolvedValue(task),
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    // Create use case
    setTaskAsUndoneUseCase = new SetTaskAsUndoneUseCase(mockTaskRepository);
  });

  it("should find the task by slug", async () => {
    // Execute the use case
    await setTaskAsUndoneUseCase.execute(taskSlug);

    // Verify that repository's findBySlug method was called with the correct slug
    expect(mockTaskRepository.findBySlug).toHaveBeenCalledWith(taskSlug);
  });

  it("should throw an error if the task is not found", async () => {
    // Setup repository to return null (task not found)
    mockTaskRepository.findBySlug = vi.fn().mockResolvedValue(null);

    // Execute the use case and expect it to throw
    await expect(setTaskAsUndoneUseCase.execute(taskSlug)).rejects.toThrow(
      "Task not found"
    );
  });

  it("should set the task as undone", async () => {
    // Execute the use case
    await setTaskAsUndoneUseCase.execute(taskSlug);

    // Verify that the task is now marked as undone
    expect(task.isDone).toBe(false);
  });

  it("should save the updated task to the repository", async () => {
    // Execute the use case
    await setTaskAsUndoneUseCase.execute(taskSlug);

    // Verify that repository's save method was called with the updated task
    expect(mockTaskRepository.save).toHaveBeenCalledWith(task);
  });

  it("should return the updated task", async () => {
    // Execute the use case
    const result = await setTaskAsUndoneUseCase.execute(taskSlug);

    // Verify the result is the updated task
    expect(result).toBe(task);
    expect(result.isDone).toBe(false);
  });
});
