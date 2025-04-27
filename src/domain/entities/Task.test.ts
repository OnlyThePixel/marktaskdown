import { describe, it, expect } from "vitest";
import { Task } from "./Task.js";

describe("Task Entity", () => {
  // Test data
  const validSlug = "task-1";
  const validTitle = "Test Task";
  const validDescription = "This is a test task";

  describe("Creation", () => {
    it("should create a task with all properties", () => {
      // Arrange & Act
      const task = new Task(validSlug, validTitle, validDescription, false);

      // Assert
      expect(task.slug).toBe(validSlug);
      expect(task.title).toBe(validTitle);
      expect(task.description).toBe(validDescription);
      expect(task.isDone).toBe(false);
    });

    it("should create a task with default isDone as false", () => {
      // Arrange & Act
      const task = new Task(validSlug, validTitle, validDescription);

      // Assert
      expect(task.isDone).toBe(false);
    });

    it("should create a task with empty description", () => {
      // Arrange & Act
      const task = new Task(validSlug, validTitle, "");

      // Assert
      expect(task.description).toBe("");
    });

    it("should throw error if slug is empty", () => {
      // Arrange & Act & Assert
      expect(() => new Task("", validTitle, validDescription)).toThrow(
        "Slug cannot be empty"
      );
    });

    it("should throw error if title is empty", () => {
      // Arrange & Act & Assert
      expect(() => new Task(validSlug, "", validDescription)).toThrow(
        "Title cannot be empty"
      );
    });
  });

  describe("Behavior", () => {
    it("should set task as done", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription, false);

      // Act
      task.setAsDone();

      // Assert
      expect(task.isDone).toBe(true);
    });

    it("should set task as undone", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription, true);

      // Act
      task.setAsUndone();

      // Assert
      expect(task.isDone).toBe(false);
    });

    it("should not change state when setting done task as done", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription, true);

      // Act
      task.setAsDone();

      // Assert
      expect(task.isDone).toBe(true);
    });

    it("should not change state when setting undone task as undone", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription, false);

      // Act
      task.setAsUndone();

      // Assert
      expect(task.isDone).toBe(false);
    });
  });

  describe("Properties", () => {
    it("should not allow modifying slug after creation", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription);

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.slug = "new-slug";
      }).toThrow();
    });

    it("should not allow modifying title after creation", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription);

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.title = "New Title";
      }).toThrow();
    });

    it("should not allow modifying description after creation", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription);

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.description = "New description";
      }).toThrow();
    });

    it("should not allow modifying isDone directly", () => {
      // Arrange
      const task = new Task(validSlug, validTitle, validDescription);

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.isDone = true;
      }).toThrow();
    });
  });
});
