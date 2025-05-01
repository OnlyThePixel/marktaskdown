/**
 * Task entity representing a task in the system
 * Core domain entity with properties and behavior
 */
import { Slug } from "../valueObjects/Slug.js";
import { Title } from "../valueObjects/Title.js";
import { Description } from "../valueObjects/Description.js";

export class Task {
  readonly #slug: Slug;
  readonly #title: Title;
  readonly #description: Description;
  #isDone: boolean;

  /**
   * Creates a new Task instance
   *
   * @param title - Title of the task
   * @param description - Description of the task
   * @param isDone - Whether the task is done (default: false)
   * @param id - Optional ID to use for slug generation (default: random string)
   */
  constructor(
    title: Title,
    description: Description,
    isDone: boolean = false,
    id?: string
  ) {
    this.#title = title;
    this.#description = description;
    this.#isDone = isDone;
    this.#slug = this.#generateSlug(id);
  }

  /**
   * Generates a slug from the title
   *
   * @param id - Optional ID to use for slug generation (default: random string)
   * @returns A slug generated from the title
   * @private
   */
  #generateSlug(id?: string): Slug {
    const taskId = id || this.#generateRandomId();
    return Slug.fromIdAndTitle(taskId, this.#title.value);
  }

  /**
   * Generates a random ID for the task
   *
   * @returns A random string ID
   * @private
   */
  #generateRandomId(): string {
    return Math.floor(Math.random() * 10000).toString();
  }

  /**
   * Get the ID of the task
   * The ID is the last part of the slug
   *
   * @returns The ID of the task
   */
  get id(): string {
    return this.#slug.value.split("-").shift() || "";
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
  get title(): Title {
    return this.#title;
  }

  /**
   * Get the description of the task
   */
  get description(): Description {
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
