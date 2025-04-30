import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetTaskBySlugUseCase } from "./GetTaskBySlugUseCase.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

describe("GetTaskBySlugUseCase", () => {
  let mockTaskRepository: TaskRepository;
  let getTaskBySlugUseCase: GetTaskBySlugUseCase;
  let task: Task;
  let slug: Slug;

  beforeEach(() => {
    // Create a mock task
    task = new Task(
      new Title("Test Task"),
      new Description("Test Description"),
      false,
      "test-slug"
    );

    slug = new Slug("test-slug");

    // Create mock repository
    mockTaskRepository = {
      findAll: vi.fn(),
      findBySlug: vi.fn().mockResolvedValue(task),
      save: vi.fn(),
      delete: vi.fn(),
    };

    // Create use case
    getTaskBySlugUseCase = new GetTaskBySlugUseCase(mockTaskRepository);
  });

  it("should retrieve a task by slug from the repository", async () => {
    // Execute the use case
    await getTaskBySlugUseCase.execute(slug);

    // Verify that repository's findBySlug method was called with the correct slug
    expect(mockTaskRepository.findBySlug).toHaveBeenCalledTimes(1);
    expect(mockTaskRepository.findBySlug).toHaveBeenCalledWith(slug);
  });

  it("should return the Task domain entity when found", async () => {
    // Execute the use case
    const result = await getTaskBySlugUseCase.execute(slug);

    // Verify the result is the expected Task entity
    expect(result).toBe(task);
    expect(result).toBeInstanceOf(Task);
    expect(result?.slug.value).toBe(task.slug.value);
    expect(result?.title.value).toBe(task.title.value);
    expect(result?.description.value).toBe(task.description.value);
    expect(result?.isDone).toBe(task.isDone);
  });

  it("should return null when task is not found", async () => {
    // Mock repository to return null (task not found)
    mockTaskRepository.findBySlug = vi.fn().mockResolvedValue(null);

    // Execute the use case
    const result = await getTaskBySlugUseCase.execute(slug);

    // Verify the result is null
    expect(result).toBeNull();
  });
});
