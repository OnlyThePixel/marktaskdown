import { ProjectRepository } from "../../../domain/repositories/ProjectRepository.js";
import { FileSystemProjectRepository } from "../../../infrastructure/repositories/FileSystemProjectRepository.js";
import { InitializeProjectResultDTO } from "../../dtos/InitializeProjectResultDTO.js";

/**
 * Use case for initializing the project structure
 * Creates the tasks directory if it doesn't exist
 */
export class InitializeProjectUseCase {
  private readonly projectRepository: ProjectRepository;

  /**
   * Creates a new InitializeProjectUseCase
   *
   * @param projectRepository - Repository for project operations
   */
  constructor(projectRepository?: ProjectRepository) {
    this.projectRepository =
      projectRepository || new FileSystemProjectRepository();
  }

  /**
   * Executes the use case
   *
   * @returns Result of the initialization
   */
  async execute(): Promise<InitializeProjectResultDTO> {
    const created = await this.projectRepository.initializeTasksDirectory();

    return {
      created,
      tasksDir: this.projectRepository.getTasksDirectoryPath(),
    };
  }
}
