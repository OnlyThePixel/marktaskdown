import { describe, it, expect } from "vitest";
import { Task } from "./Task.js";
import { Slug } from "../valueObjects/Slug.js";
import { Title } from "../valueObjects/Title.js";
import { Description } from "../valueObjects/Description.js";

describe("Task Entity", () => {
  // Test data
  const validTitle = new Title("Test Task");
  const validDescription = new Description("This is a test task");

  describe("Creation", () => {
    it("should create a task with all properties", () => {
      // Arrange & Act
      const task = new Task(validTitle, validDescription, false, "1");

      // Assert
      expect(task.slug.value).toBe("1-test-task");
      expect(task.title).toBe(validTitle);
      expect(task.description).toBe(validDescription);
      expect(task.isDone).toBe(false);
    });

    it("should create a task with default isDone as false", () => {
      // Arrange & Act
      const task = new Task(validTitle, validDescription, undefined, "1");

      // Assert
      expect(task.isDone).toBe(false);
    });

    it("should create a task with empty description", () => {
      // Arrange & Act
      const task = new Task(validTitle, new Description(""), undefined, "1");

      // Assert
      expect(task.description.value).toBe("");
    });

    it("should generate a slug from the title", () => {
      // Arrange & Act
      const task = new Task(validTitle, validDescription, false, "1");

      // Assert
      expect(task.slug.value).toBe("1-test-task");
    });

    it("should generate a random ID for the slug if none is provided", () => {
      // Arrange & Act
      const task = new Task(validTitle, validDescription);

      // Assert
      expect(task.slug.value).toMatch(/^\d+-test-task$/);
    });

    it("should throw error if title is invalid", () => {
      // Arrange & Act & Assert
      expect(() => new Task(new Title(""), validDescription)).toThrow(
        "Title cannot be empty"
      );
    });
  });

  describe("Behavior", () => {
    it("should set task as done", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act
      task.setAsDone();

      // Assert
      expect(task.isDone).toBe(true);
    });

    it("should set task as undone", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, true, "1");

      // Act
      task.setAsUndone();

      // Assert
      expect(task.isDone).toBe(false);
    });

    it("should not change state when setting done task as done", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, true, "1");

      // Act
      task.setAsDone();

      // Assert
      expect(task.isDone).toBe(true);
    });

    it("should not change state when setting undone task as undone", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act
      task.setAsUndone();

      // Assert
      expect(task.isDone).toBe(false);
    });
  });

  describe("Properties", () => {
    it("should not allow modifying slug after creation", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.slug = new Slug("new-slug");
      }).toThrow();
    });

    it("should not allow modifying title after creation", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.title = new Title("New Title");
      }).toThrow();
    });

    it("should not allow modifying description after creation", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.description = new Description("New description");
      }).toThrow();
    });

    it("should not allow modifying isDone directly", () => {
      // Arrange
      const task = new Task(validTitle, validDescription, false, "1");

      // Act & Assert
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        task.isDone = true;
      }).toThrow();
    });
  });
});
