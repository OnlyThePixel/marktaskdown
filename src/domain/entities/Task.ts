/**
 * Task entity representing a task in the system
 * Core domain entity with properties and behavior
 */
import { Slug } from "../valueObjects/Slug.js";

export class Task {
  readonly #slug: Slug;
  readonly #title: string;
  readonly #description: string;
  #isDone: boolean;

  /**
   * Creates a new Task instance
   *
   * @param slug - Unique identifier for the task
   * @param title - Title of the task
   * @param description - Description of the task
   * @param isDone - Whether the task is done (default: false)
   */
  constructor(
    slug: Slug,
    title: string,
    description: string,
    isDone: boolean = false
  ) {
    // Validate required fields
    if (!title) {
      throw new Error("Title cannot be empty");
    }

    this.#slug = slug;
    this.#title = title;
    this.#description = description;
    this.#isDone = isDone;
  }

  /**
   * Get the slug of the task
   */
  get slug(): Slug {
    return this.#slug;
  }

  /**
   * Get the title of the task
   */
  get title(): string {
    return this.#title;
  }

  /**
   * Get the description of the task
   */
  get description(): string {
    return this.#description;
  }

  /**
   * Get whether the task is done
   */
  get isDone(): boolean {
    return this.#isDone;
  }

  /**
   * Set the task as done
   */
  setAsDone(): void {
    this.#isDone = true;
  }

  /**
   * Set the task as undone
   */
  setAsUndone(): void {
    this.#isDone = false;
  }
}
