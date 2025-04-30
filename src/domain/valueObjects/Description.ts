/**
 * Description Value Object
 * Represents the description of a task with validation rules
 */
export class Description {
  readonly #value: string;

  /**
   * Creates a new Description instance with validation
   *
   * @param value - The description string value
   * @throws Error if the description is invalid
   */
  constructor(value: string) {
    const trimmedValue = value.trim();
    this.validateDescription(trimmedValue);
    this.#value = trimmedValue;
  }

  /**
   * Get the string value of the description
   */
  get value(): string {
    return this.#value;
  }

  /**
   * Validates that a description string meets all requirements
   *
   * @param description - The description string to validate
   * @throws Error if the description is invalid
   */
  private validateDescription(description: string): void {
    if (description.length > 1000) {
      throw new Error("Description cannot exceed 1000 characters");
    }
  }

  /**
   * Checks if this description is equal to another description
   *
   * @param other - The other description to compare with
   * @returns true if the descriptions are equal, false otherwise
   */
  equals(other: Description | null | undefined): boolean {
    if (!other) {
      return false;
    }

    return this.#value === other.value;
  }

  /**
   * Returns the string representation of the description
   *
   * @returns The string value of the description
   */
  toString(): string {
    return this.#value;
  }
}
