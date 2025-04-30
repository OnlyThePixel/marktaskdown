import { describe, it, expect, beforeEach } from "vitest";
import { Task } from "../entities/Task.js";
import { Title } from "../valueObjects/Title.js";
import { Description } from "../valueObjects/Description.js";
import { Slug } from "../valueObjects/Slug.js";
import { TaskRepository } from "./TaskRepository.js";

// Mock implementation of TaskRepository for testing
class MockTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.slug.value, task);
  }

  async findBySlug(slug: Slug): Promise<Task | null> {
    const task = this.tasks.get(slug.value);
    return task || null;
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async delete(slug: Slug): Promise<void> {
    this.tasks.delete(slug.value);
  }
}

describe("TaskRepository Interface", () => {
  let repository: TaskRepository;
  let task1: Task;
  let task2: Task;
  let slug1: Slug;
  let slug2: Slug;

  beforeEach(() => {
    // Create a new repository instance for each test
    repository = new MockTaskRepository();

    // Create test tasks
    task1 = new Task(
      new Title("Test Task 1"),
      new Description("Description for task 1"),
      false,
      "1"
    );

    task2 = new Task(
      new Title("Test Task 2"),
      new Description("Description for task 2"),
      true,
      "2"
    );

    slug1 = task1.slug;
    slug2 = task2.slug;
  });

  describe("save", () => {
    it("should save a task", async () => {
      // Act
      await repository.save(task1);

      // Assert
      const savedTask = await repository.findBySlug(slug1);
      expect(savedTask).toBeDefined();
      expect(savedTask?.slug.value).toBe(slug1.value);
    });

    it("should update an existing task", async () => {
      // Arrange
      await repository.save(task1);

      // Create a new task with the same slug but different state
      const updatedTask = new Task(
        task1.title,
        task1.description,
        true, // Changed from false to true
        "1" // Same ID to generate the same slug
      );

      // Act
      await repository.save(updatedTask);

      // Assert
      const savedTask = await repository.findBySlug(slug1);
      expect(savedTask).toBeDefined();
      expect(savedTask?.isDone).toBe(true);
    });
  });

  describe("findBySlug", () => {
    it("should return a task by slug", async () => {
      // Arrange
      await repository.save(task1);

      // Act
      const foundTask = await repository.findBySlug(slug1);

      // Assert
      expect(foundTask).toBeDefined();
      expect(foundTask?.slug.value).toBe(slug1.value);
      expect(foundTask?.title.value).toBe(task1.title.value);
      expect(foundTask?.description.value).toBe(task1.description.value);
      expect(foundTask?.isDone).toBe(task1.isDone);
    });

    it("should return null if task not found", async () => {
      // Act
      const nonExistentSlug = new Slug("non-existent-slug");
      const foundTask = await repository.findBySlug(nonExistentSlug);

      // Assert
      expect(foundTask).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all tasks", async () => {
      // Arrange
      await repository.save(task1);
      await repository.save(task2);

      // Act
      const tasks = await repository.findAll();

      // Assert
      expect(tasks).toHaveLength(2);
      expect(tasks.some((task) => task.slug.value === slug1.value)).toBe(true);
      expect(tasks.some((task) => task.slug.value === slug2.value)).toBe(true);
    });

    it("should return empty array if no tasks exist", async () => {
      // Act
      const tasks = await repository.findAll();

      // Assert
      expect(tasks).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("should delete a task by slug", async () => {
      // Arrange
      await repository.save(task1);
      await repository.save(task2);

      // Act
      await repository.delete(slug1);

      // Assert
      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].slug.value).toBe(slug2.value);

      const deletedTask = await repository.findBySlug(slug1);
      expect(deletedTask).toBeNull();
    });

    it("should not throw error when deleting non-existent task", async () => {
      // Act & Assert
      const nonExistentSlug = new Slug("non-existent-slug");
      await expect(repository.delete(nonExistentSlug)).resolves.not.toThrow();
    });
  });
});
