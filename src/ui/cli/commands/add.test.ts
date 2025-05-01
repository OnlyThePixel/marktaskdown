import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { addCommand } from "./add.js";
import { input } from "@inquirer/prompts";
import { CreateTaskUseCase } from "../../../application/useCases/commands/CreateTaskUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn().mockResolvedValue(""),
  confirm: vi.fn().mockResolvedValue(false),
}));

// Mock CreateTaskUseCase
vi.mock("../../../application/useCases/commands/CreateTaskUseCase.js", () => ({
  CreateTaskUseCase: vi.fn().mockReturnValue({
    execute: vi.fn().mockResolvedValue({
      slug: { value: "test-task" },
      title: { value: "Test Task" },
      description: { value: "Test description" },
      isDone: false,
    }),
  }),
}));

// Mock FileSystemTaskRepository
vi.mock(
  "../../../infrastructure/repositories/FileSystemTaskRepository.js",
  () => ({
    FileSystemTaskRepository: vi.fn().mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(undefined),
      findBySlug: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
  })
);

describe("Add Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;

  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.spyOn(console, "log");
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it("should check if tasks directory exists", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);

    await addCommand("Test Task", {});

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
  });

  it("should create a task with title only in non-interactive mode", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);

    await addCommand("Test Task", {});

    // Verify repository was created with correct path
    expect(FileSystemTaskRepository).toHaveBeenCalledWith(tasksDir);

    // Verify use case was created with repository
    expect(CreateTaskUseCase).toHaveBeenCalledWith(expect.any(Object));

    // Verify use case was executed with correct DTO
    const useCase = vi.mocked(CreateTaskUseCase).mock.results[0].value;
    expect(useCase.execute).toHaveBeenCalledWith({
      title: "Test Task",
      description: "",
    });

    expect(console.log).toHaveBeenCalledWith("✅ Created task: Test Task");
    expect(console.log).toHaveBeenCalledWith("📝 File: test-task.md");
  });

  it("should create a task with description in non-interactive mode", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);

    await addCommand("Test Task", { description: "This is a test task" });

    const useCase = vi.mocked(CreateTaskUseCase).mock.results[0].value;
    expect(useCase.execute).toHaveBeenCalledWith({
      title: "Test Task",
      description: "This is a test task",
    });
  });

  it("should enter interactive mode when no title is provided", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(input)
      .mockResolvedValueOnce("Interactive Task") // Title prompt
      .mockResolvedValueOnce("This is an interactive task"); // Description prompt

    await addCommand();

    expect(input).toHaveBeenCalledWith({
      message: "Enter task title:",
      validate: expect.any(Function),
    });

    expect(input).toHaveBeenCalledWith({
      message: "Enter task description (optional):",
    });

    const useCase = vi.mocked(CreateTaskUseCase).mock.results[0].value;
    expect(useCase.execute).toHaveBeenCalledWith({
      title: "Interactive Task",
      description: "This is an interactive task",
    });
  });

  it("should handle empty description in interactive mode", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(input)
      .mockResolvedValueOnce("Task Without Description") // Title prompt
      .mockResolvedValueOnce(""); // Empty description

    await addCommand();

    const useCase = vi.mocked(CreateTaskUseCase).mock.results[0].value;
    expect(useCase.execute).toHaveBeenCalledWith({
      title: "Task Without Description",
      description: "",
    });
  });

  it("should validate title is not empty in interactive mode", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);

    // Setup the mock to test the validate function
    vi.mocked(input).mockImplementationOnce((options) => {
      if (options && typeof options.validate === "function") {
        // First call the validate function with empty string
        const validateResult = options.validate("");
        expect(validateResult).toBe("Title cannot be empty");
      }

      // Return a promise with the cancel method
      const promise = Promise.resolve("Valid Title");
      (promise as Promise<string> & { cancel: () => void }).cancel = () => {};
      return promise as Promise<string> & { cancel: () => void };
    });

    vi.mocked(input).mockResolvedValueOnce("Description"); // Description prompt

    await addCommand();

    expect(input).toHaveBeenCalledWith({
      message: "Enter task title:",
      validate: expect.any(Function),
    });
  });
});
