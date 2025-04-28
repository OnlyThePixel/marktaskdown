import { describe, it, expect } from "vitest";
import { Title } from "./Title.js";

describe("Title Value Object", () => {
  describe("Creation", () => {
    it("should create a valid title", () => {
      // Arrange & Act
      const title = new Title("Test Task");

      // Assert
      expect(title.value).toBe("Test Task");
    });

    it("should throw error if title is empty", () => {
      // Arrange & Act & Assert
      expect(() => new Title("")).toThrow("Title cannot be empty");
    });

    it("should throw error if title contains only whitespace", () => {
      // Arrange & Act & Assert
      expect(() => new Title("   ")).toThrow("Title cannot be empty");
    });

    it("should throw error if title exceeds maximum length", () => {
      // Arrange
      const longTitle = "a".repeat(101);

      // Act & Assert
      expect(() => new Title(longTitle)).toThrow(
        "Title cannot exceed 100 characters"
      );
    });
  });

  describe("Equality", () => {
    it("should be equal to another title with the same value", () => {
      // Arrange
      const title1 = new Title("Test Task");
      const title2 = new Title("Test Task");

      // Act & Assert
      expect(title1.equals(title2)).toBe(true);
    });

    it("should not be equal to another title with a different value", () => {
      // Arrange
      const title1 = new Title("Test Task 1");
      const title2 = new Title("Test Task 2");

      // Act & Assert
      expect(title1.equals(title2)).toBe(false);
    });

    it("should not be equal to null or undefined", () => {
      // Arrange
      const title = new Title("Test Task");

      // Act & Assert
      expect(title.equals(null)).toBe(false);
      expect(title.equals(undefined)).toBe(false);
    });
  });

  describe("String Representation", () => {
    it("should convert to string representation", () => {
      // Arrange
      const title = new Title("Test Task");

      // Act & Assert
      expect(title.toString()).toBe("Test Task");
    });
  });

  describe("Validation", () => {
    it("should trim whitespace from the beginning and end", () => {
      // Arrange & Act
      const title = new Title("  Test Task  ");

      // Assert
      expect(title.value).toBe("Test Task");
    });

    it("should preserve internal whitespace", () => {
      // Arrange & Act
      const title = new Title("Test  Task");

      // Assert
      expect(title.value).toBe("Test  Task");
    });
  });
});
