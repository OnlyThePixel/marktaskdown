/**
 * Slug Value Object
 * Represents a unique identifier for a task in URL-friendly format
 */
export class Slug {
  readonly #value: string;

  /**
   * Creates a new Slug instance with validation
   *
   * @param value - The slug string value
   * @throws Error if the slug is invalid
   */
  constructor(value: string) {
    this.validateSlug(value);
    this.#value = value;
  }

  /**
   * Get the string value of the slug
   */
  get value(): string {
    return this.#value;
  }

  /**
   * Validates that a slug string meets all requirements
   *
   * @param slug - The slug string to validate
   * @throws Error if the slug is invalid
   */
  private validateSlug(slug: string): void {
    if (!slug) {
      throw new Error("Slug cannot be empty");
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    }

    if (slug.startsWith("-") || slug.endsWith("-")) {
      throw new Error("Slug cannot start or end with a hyphen");
    }
  }

  /**
   * Creates a slug from an ID and title
   *
   * @param id - The ID to use as prefix
   * @param title - The title to convert to slug format
   * @returns A new Slug instance
   * @throws Error if the ID or title is empty
   */
  static fromIdAndTitle(id: string, title: string): Slug {
    if (!id) {
      throw new Error("ID cannot be empty");
    }

    if (!title) {
      throw new Error("Title cannot be empty");
    }

    // Convert title to slug format:
    // 1. Convert to lowercase
    // 2. Replace special characters and spaces with hyphens
    // 3. Remove consecutive hyphens
    // 4. Trim leading/trailing spaces
    const slugTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-\s]/g, "") // Remove special characters except spaces
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace consecutive hyphens with a single hyphen

    // Combine ID and processed title
    const slugValue = `${id}-${slugTitle}`;

    return new Slug(slugValue);
  }

  /**
   * Checks if this slug is equal to another slug
   *
   * @param other - The other slug to compare with
   * @returns true if the slugs are equal, false otherwise
   */
  equals(other: Slug | null | undefined): boolean {
    if (!other) {
      return false;
    }

    return this.#value === other.value;
  }

  /**
   * Returns the string representation of the slug
   *
   * @returns The string value of the slug
   */
  toString(): string {
    return this.#value;
  }
}
