import { describe, it, expect } from "vitest";
import { Description } from "./Description.js";

describe("Description Value Object", () => {
  describe("Creation", () => {
    it("should create a valid description", () => {
      // Arrange & Act
      const description = new Description("This is a test description");

      // Assert
      expect(description.value).toBe("This is a test description");
    });

    it("should allow empty description", () => {
      // Arrange & Act
      const description = new Description("");

      // Assert
      expect(description.value).toBe("");
    });

    it("should trim whitespace from the beginning and end", () => {
      // Arrange & Act
      const description = new Description("  Test description  ");

      // Assert
      expect(description.value).toBe("Test description");
    });

    it("should throw error if description exceeds maximum length", () => {
      // Arrange
      const longDescription = "a".repeat(1001);

      // Act & Assert
      expect(() => new Description(longDescription)).toThrow(
        "Description cannot exceed 1000 characters"
      );
    });
  });

  describe("Equality", () => {
    it("should be equal to another description with the same value", () => {
      // Arrange
      const description1 = new Description("Test description");
      const description2 = new Description("Test description");

      // Act & Assert
      expect(description1.equals(description2)).toBe(true);
    });

    it("should not be equal to another description with a different value", () => {
      // Arrange
      const description1 = new Description("Test description 1");
      const description2 = new Description("Test description 2");

      // Act & Assert
      expect(description1.equals(description2)).toBe(false);
    });

    it("should not be equal to null or undefined", () => {
      // Arrange
      const description = new Description("Test description");

      // Act & Assert
      expect(description.equals(null)).toBe(false);
      expect(description.equals(undefined)).toBe(false);
    });
  });

  describe("String Representation", () => {
    it("should convert to string representation", () => {
      // Arrange
      const description = new Description("Test description");

      // Act & Assert
      expect(description.toString()).toBe("Test description");
    });
  });

  describe("Validation", () => {
    it("should preserve internal whitespace", () => {
      // Arrange & Act
      const description = new Description("Test  description");

      // Assert
      expect(description.value).toBe("Test  description");
    });

    it("should handle multiline descriptions", () => {
      // Arrange
      const multilineDescription = "Line 1\nLine 2\nLine 3";

      // Act
      const description = new Description(multilineDescription);

      // Assert
      expect(description.value).toBe(multilineDescription);
    });
  });
});
