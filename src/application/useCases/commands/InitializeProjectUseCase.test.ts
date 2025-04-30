import { describe, it, expect, vi, beforeEach } from "vitest";
import { InitializeProjectUseCase } from "./InitializeProjectUseCase.js";
import { ProjectRepository } from "../../../domain/repositories/ProjectRepository.js";
import { FileSystemProjectRepository } from "../../../infrastructure/repositories/FileSystemProjectRepository.js";

// Mock the FileSystemProjectRepository
vi.mock("../../../infrastructure/repositories/FileSystemProjectRepository.js");

// Create a mock ProjectRepository
const createMockProjectRepository = (
  initializeResult: boolean,
  tasksDir: string
): ProjectRepository => ({
  initializeTasksDirectory: vi.fn().mockResolvedValue(initializeResult),
  getTasksDirectoryPath: vi.fn().mockReturnValue(tasksDir),
});

describe("InitializeProjectUseCase", () => {
  const tasksDir = "/mock/current/dir/tasks";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates tasks directory if it does not exist", async () => {
    // Arrange
    const mockRepository = createMockProjectRepository(true, tasksDir);
    const useCase = new InitializeProjectUseCase(mockRepository);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockRepository.initializeTasksDirectory).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTasksDirectoryPath).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(true);
    expect(result.tasksDir).toBe(tasksDir);
  });

  it("does not create tasks directory if it already exists", async () => {
    // Arrange
    const mockRepository = createMockProjectRepository(false, tasksDir);
    const useCase = new InitializeProjectUseCase(mockRepository);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockRepository.initializeTasksDirectory).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTasksDirectoryPath).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(false);
    expect(result.tasksDir).toBe(tasksDir);
  });

  it("uses a default repository when none is provided", async () => {
    // Setup mock implementation for FileSystemProjectRepository
    const mockInitialize = vi.fn().mockResolvedValue(true);
    const mockGetPath = vi.fn().mockReturnValue(tasksDir);

    vi.mocked(FileSystemProjectRepository).mockImplementation(() => ({
      initializeTasksDirectory: mockInitialize,
      getTasksDirectoryPath: mockGetPath,
      tasksDir: tasksDir,
    }));

    // Arrange
    const useCase = new InitializeProjectUseCase();

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(mockGetPath).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(true);
    expect(result.tasksDir).toBe(tasksDir);
  });
});
