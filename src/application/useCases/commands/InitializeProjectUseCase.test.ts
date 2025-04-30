import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InitializeProjectUseCase } from "./InitializeProjectUseCase.js";
import fs from "fs";

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

// Mock path module
vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

describe("InitializeProjectUseCase", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;

  // Mock process.cwd
  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it("creates tasks directory if it does not exist", async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const useCase = new InitializeProjectUseCase();

    // Act
    const result = await useCase.execute();

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(tasksDir, { recursive: true });
    expect(result.created).toBe(true);
    expect(result.tasksDir).toBe(tasksDir);
  });

  it("does not create tasks directory if it already exists", async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const useCase = new InitializeProjectUseCase();

    // Act
    const result = await useCase.execute();

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(result.created).toBe(false);
    expect(result.tasksDir).toBe(tasksDir);
  });

  it("allows specifying a custom tasks directory", async () => {
    // Arrange
    const customDir = "/custom/tasks/dir";
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const useCase = new InitializeProjectUseCase(customDir);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(customDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(customDir, { recursive: true });
    expect(result.created).toBe(true);
    expect(result.tasksDir).toBe(customDir);
  });
});
