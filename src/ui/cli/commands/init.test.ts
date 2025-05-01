import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initCommand } from "./init.js";
import { InitializeProjectUseCase } from "../../../application/useCases/commands/InitializeProjectUseCase.js";

// Mock the InitializeProjectUseCase
vi.mock("../../../application/useCases/commands/InitializeProjectUseCase.js");

describe("Init Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;

  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it("calls InitializeProjectUseCase and logs the result when directory is created", async () => {
    // Arrange
    const mockExecute = vi.fn().mockResolvedValue({
      created: true,
      tasksDir,
    });

    // Create a proper mock of the class
    vi.mocked(InitializeProjectUseCase.prototype.execute).mockImplementation(
      mockExecute
    );

    const consoleSpy = vi.spyOn(console, "log");

    // Act
    await initCommand();

    // Assert
    expect(InitializeProjectUseCase).toHaveBeenCalledWith();
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("✅ Created tasks directory");
    expect(consoleSpy).toHaveBeenCalledWith(
      '🚀 Initialization complete! You can now add tasks with "mtd add"'
    );
  });

  it("calls InitializeProjectUseCase and logs the result when directory already exists", async () => {
    // Arrange
    const mockExecute = vi.fn().mockResolvedValue({
      created: false,
      tasksDir,
    });

    // Create a proper mock of the class
    vi.mocked(InitializeProjectUseCase.prototype.execute).mockImplementation(
      mockExecute
    );

    const consoleSpy = vi.spyOn(console, "log");

    // Act
    await initCommand();

    // Assert
    expect(InitializeProjectUseCase).toHaveBeenCalledWith();
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "✅ Tasks directory already exists"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '🚀 Initialization complete! You can now add tasks with "mtd add"'
    );
  });
});
