import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetTaskAsDoneUseCase } from "./SetTaskAsDoneUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

describe("SetTaskAsDoneUseCase", () => {
  let mockTaskRepository: TaskRepository;
  let setTaskAsDoneUseCase: SetTaskAsDoneUseCase;
  let task: Task;
  let taskSlug: Slug;

  beforeEach(() => {
    // Create a task
    task = new Task(
      new Title("Test Task"),
      new Description("Test Description"),
      false, // Not done initially
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
    setTaskAsDoneUseCase = new SetTaskAsDoneUseCase(mockTaskRepository);
  });

  it("should find the task by slug", async () => {
    // Execute the use case
    await setTaskAsDoneUseCase.execute(taskSlug);

    // Verify that repository's findBySlug method was called with the correct slug
    expect(mockTaskRepository.findBySlug).toHaveBeenCalledWith(taskSlug);
  });

  it("should throw an error if the task is not found", async () => {
    // Setup repository to return null (task not found)
    mockTaskRepository.findBySlug = vi.fn().mockResolvedValue(null);

    // Execute the use case and expect it to throw
    await expect(setTaskAsDoneUseCase.execute(taskSlug)).rejects.toThrow(
      "Task not found"
    );
  });

  it("should set the task as done", async () => {
    // Execute the use case
    await setTaskAsDoneUseCase.execute(taskSlug);

    // Verify that the task is now marked as done
    expect(task.isDone).toBe(true);
  });

  it("should save the updated task to the repository", async () => {
    // Execute the use case
    await setTaskAsDoneUseCase.execute(taskSlug);

    // Verify that repository's save method was called with the updated task
    expect(mockTaskRepository.save).toHaveBeenCalledWith(task);
  });

  it("should return the updated task", async () => {
    // Execute the use case
    const result = await setTaskAsDoneUseCase.execute(taskSlug);

    // Verify the result is the updated task
    expect(result).toBe(task);
    expect(result.isDone).toBe(true);
  });
});
