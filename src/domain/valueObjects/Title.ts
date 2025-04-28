/**
 * Title Value Object
 * Represents the title of a task with validation rules
 */
export class Title {
  readonly #value: string;

  /**
   * Creates a new Title instance with validation
   *
   * @param value - The title string value
   * @throws Error if the title is invalid
   */
  constructor(value: string) {
    const trimmedValue = value.trim();
    this.validateTitle(trimmedValue);
    this.#value = trimmedValue;
  }

  /**
   * Get the string value of the title
   */
  get value(): string {
    return this.#value;
  }

  /**
   * Validates that a title string meets all requirements
   *
   * @param title - The title string to validate
   * @throws Error if the title is invalid
   */
  private validateTitle(title: string): void {
    if (!title) {
      throw new Error("Title cannot be empty");
    }

    if (title.length > 100) {
      throw new Error("Title cannot exceed 100 characters");
    }
  }

  /**
   * Checks if this title is equal to another title
   *
   * @param other - The other title to compare with
   * @returns true if the titles are equal, false otherwise
   */
  equals(other: Title | null | undefined): boolean {
    if (!other) {
      return false;
    }

    return this.#value === other.value;
  }

  /**
   * Returns the string representation of the title
   *
   * @returns The string value of the title
   */
  toString(): string {
    return this.#value;
  }
}
