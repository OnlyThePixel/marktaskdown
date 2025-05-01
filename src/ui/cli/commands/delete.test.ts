import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { deleteCommand } from "./delete.js";
import { checkbox, confirm } from "@inquirer/prompts";
import { DeleteTaskUseCase } from "../../../application/useCases/commands/DeleteTaskUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { TaskRepository } from "../../../domain/repositories/TaskRepository.js";

// Mock the file system
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    statSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

vi.mock("@inquirer/prompts", () => ({
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

// Mock the DeleteTaskUseCase and FileSystemTaskRepository
vi.mock("../../../application/useCases/commands/DeleteTaskUseCase.js");
vi.mock("../../../infrastructure/repositories/FileSystemTaskRepository.js");

describe("Delete Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;
  const archiveDir = `${tasksDir}/.archive`;

  const originalCwd = process.cwd;
  let mockTaskRepository: TaskRepository;
  let mockDeleteTaskUseCase: DeleteTaskUseCase;
  let mockTasks: Task[];

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.spyOn(console, "log");
    vi.spyOn(console, "warn");
    vi.clearAllMocks();

    // Create mock tasks
    mockTasks = [
      new Task(
        new Title("Task 1"),
        new Description("Task 1 description"),
        false,
        "1"
      ),
      new Task(
        new Title("Task 2"),
        new Description("Task 2 description"),
        true,
        "2"
      ),
    ];

    // Setup mock repository
    mockTaskRepository = {
      findAll: vi.fn().mockResolvedValue(mockTasks),
      delete: vi.fn().mockResolvedValue(undefined),
      findBySlug: vi.fn().mockImplementation((slug) => {
        const task = mockTasks.find((t) => t.slug.value === slug.value);
        return Promise.resolve(task || null);
      }),
    } as unknown as TaskRepository;

    // Setup mock use case
    mockDeleteTaskUseCase = {
      execute: vi.fn().mockImplementation(async (slug) => {
        const task = mockTasks.find((t) => t.slug.value === slug.value);
        if (!task) throw new Error("Task not found");
        return task;
      }),
    } as unknown as DeleteTaskUseCase;

    // Mock the constructors
    vi.mocked(FileSystemTaskRepository).mockImplementation(
      () => mockTaskRepository as unknown as FileSystemTaskRepository
    );
    vi.mocked(DeleteTaskUseCase).mockImplementation(
      () => mockDeleteTaskUseCase
    );
  });

  afterEach(() => {
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

  it("should check if tasks directory exists", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await deleteCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
    expect(fs.readdirSync).not.toHaveBeenCalled();
  });

  it("should create archive directory if it doesn't exist", async () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // tasks directory exists
      .mockReturnValueOnce(false); // archive directory doesn't exist
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    await deleteCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(archiveDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(archiveDir, { recursive: true });
  });

  it("should handle when no tasks are found", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock repository to return empty array
    vi.mocked(mockTaskRepository.findAll).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(mockTaskRepository.findAll).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
  });

  it("should list all tasks regardless of status", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock checkbox to return empty array to exit early
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to delete",
      choices: [
        {
          name: "Task 1 (PENDING)",
          value: "1-task-1",
          message: "Task 1 (PENDING)",
        },
        { name: "Task 2 (DONE)", value: "2-task-2", message: "Task 2 (DONE)" },
      ],
    });
  });

  it("should handle empty selection", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return content
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
    );

    // Mock checkbox to return empty array
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(console.log).toHaveBeenCalledWith("❌ No tasks selected.");
    expect(confirm).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it("should prompt for confirmation after selection", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return content
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
    );

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["task-1.md"]);

    // Mock confirm to return false (cancel)
    vi.mocked(confirm).mockResolvedValueOnce(false);

    await deleteCommand();

    expect(confirm).toHaveBeenCalledWith({
      message: "Are you sure you want to delete 1 task(s)?",
      default: false,
    });
    expect(console.log).toHaveBeenCalledWith("❌ Operation cancelled.");
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it("should use DeleteTaskUseCase to delete selected tasks", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["1-task-1", "2-task-2"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    await deleteCommand();

    // Verify that the use case was called for each selected task
    expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledTimes(2);
    expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ value: "1-task-1" })
    );
    expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ value: "2-task-2" })
    );

    // Check success messages
    expect(console.log).toHaveBeenCalledWith("🗑️ Archived task: Task 1");
    expect(console.log).toHaveBeenCalledWith("🗑️ Archived task: Task 2");
  });

  it("should archive tasks when deleting them", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["1-task-1"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    // Mock readFileSync to return content for the task
    const taskContent =
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description";
    vi.mocked(fs.readFileSync).mockReturnValue(taskContent);

    await deleteCommand();

    // Check if file was written to archive
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${archiveDir}/1-task-1.md`,
      taskContent
    );

    // Verify that the use case was called
    expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ value: "1-task-1" })
    );
  });

  it("should handle invalid files", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock repository to throw an error when finding tasks
    vi.mocked(mockTaskRepository.findAll).mockImplementationOnce(() => {
      console.warn("⚠️ Warning: Could not parse task file: invalid-task.md");
      return Promise.resolve([mockTasks[1]]);
    });

    // Mock checkbox to return empty array to exit early
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Warning: Could not parse task file: invalid-task.md"
    );
    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to delete",
      choices: [
        { name: "Task 2 (DONE)", value: "2-task-2", message: "Task 2 (DONE)" },
      ],
    });
  });

  it("should handle errors when deleting tasks", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["1-task-1"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    // Mock use case to throw an error
    vi.mocked(mockDeleteTaskUseCase.execute).mockRejectedValueOnce(
      new Error("Mock delete error")
    );

    await deleteCommand();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Error deleting task: 1-task-1",
      expect.any(Error)
    );
  });

  it("should handle errors when archiving tasks", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["1-task-1"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    // Mock readFileSync to return content
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
    );

    // Mock writeFileSync to throw an error
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error("Mock file write error");
    });

    await deleteCommand();

    // The use case should not be called because archiving fails first
    expect(mockDeleteTaskUseCase.execute).not.toHaveBeenCalled();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Error archiving task file: 1-task-1.md",
      expect.any(Error)
    );

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Error deleting task: 1-task-1",
      expect.any(Error)
    );
  });
});
