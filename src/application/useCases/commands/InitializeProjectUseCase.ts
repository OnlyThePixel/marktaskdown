import fs from "fs";
import path from "path";
import { InitializeProjectResultDTO } from "../../dtos/InitializeProjectResultDTO.js";

/**
 * Use case for initializing the project structure
 * Creates the tasks directory if it doesn't exist
 */
export class InitializeProjectUseCase {
  private readonly tasksDir: string;

  /**
   * Creates a new InitializeProjectUseCase
   *
   * @param tasksDir - Optional custom path for the tasks directory
   */
  constructor(tasksDir?: string) {
    this.tasksDir = tasksDir || path.join(process.cwd(), "tasks");
  }

  /**
   * Executes the use case
   *
   * @returns Result of the initialization
   */
  async execute(): Promise<InitializeProjectResultDTO> {
    const created = !fs.existsSync(this.tasksDir);

    if (created) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }

    return {
      created,
      tasksDir: this.tasksDir,
    };
  }
}
