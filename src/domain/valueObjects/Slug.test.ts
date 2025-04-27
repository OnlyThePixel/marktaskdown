import { describe, it, expect } from "vitest";
import { Slug } from "./Slug.js";

describe("Slug Value Object", () => {
  describe("Creation", () => {
    it("should create a valid slug", () => {
      // Arrange & Act
      const slug = new Slug("task-1");

      // Assert
      expect(slug.value).toBe("task-1");
    });

    it("should throw error if slug is empty", () => {
      // Arrange & Act & Assert
      expect(() => new Slug("")).toThrow("Slug cannot be empty");
    });

    it("should throw error if slug contains invalid characters", () => {
      // Arrange & Act & Assert
      expect(() => new Slug("task@1")).toThrow(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
      expect(() => new Slug("Task-1")).toThrow(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
      expect(() => new Slug("task 1")).toThrow(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    });

    it("should throw error if slug starts or ends with a hyphen", () => {
      // Arrange & Act & Assert
      expect(() => new Slug("-task-1")).toThrow(
        "Slug cannot start or end with a hyphen"
      );
      expect(() => new Slug("task-1-")).toThrow(
        "Slug cannot start or end with a hyphen"
      );
    });
  });

  describe("Factory Methods", () => {
    it("should create a slug from ID and title", () => {
      // Arrange & Act
      const slug = Slug.fromIdAndTitle("1", "Test Task");

      // Assert
      expect(slug.value).toBe("1-test-task");
    });

    it("should handle special characters in title when creating slug", () => {
      // Arrange & Act
      const slug = Slug.fromIdAndTitle("2", "Test: Task with Special & Chars!");

      // Assert
      expect(slug.value).toBe("2-test-task-with-special-chars");
    });

    it("should handle multiple spaces and trim title when creating slug", () => {
      // Arrange & Act
      const slug = Slug.fromIdAndTitle("3", "  Test   Task  with   Spaces  ");

      // Assert
      expect(slug.value).toBe("3-test-task-with-spaces");
    });

    it("should throw error if ID is empty", () => {
      // Arrange & Act & Assert
      expect(() => Slug.fromIdAndTitle("", "Test Task")).toThrow(
        "ID cannot be empty"
      );
    });

    it("should throw error if title is empty", () => {
      // Arrange & Act & Assert
      expect(() => Slug.fromIdAndTitle("1", "")).toThrow(
        "Title cannot be empty"
      );
    });
  });

  describe("Equality", () => {
    it("should be equal to another slug with the same value", () => {
      // Arrange
      const slug1 = new Slug("task-1");
      const slug2 = new Slug("task-1");

      // Act & Assert
      expect(slug1.equals(slug2)).toBe(true);
    });

    it("should not be equal to another slug with a different value", () => {
      // Arrange
      const slug1 = new Slug("task-1");
      const slug2 = new Slug("task-2");

      // Act & Assert
      expect(slug1.equals(slug2)).toBe(false);
    });

    it("should not be equal to null or undefined", () => {
      // Arrange
      const slug = new Slug("task-1");

      // Act & Assert
      expect(slug.equals(null)).toBe(false);
      expect(slug.equals(undefined)).toBe(false);
    });
  });

  describe("String Representation", () => {
    it("should convert to string representation", () => {
      // Arrange
      const slug = new Slug("task-1");

      // Act & Assert
      expect(slug.toString()).toBe("task-1");
    });
  });
});
