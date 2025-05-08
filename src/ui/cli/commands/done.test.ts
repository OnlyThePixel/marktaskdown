import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { doneCommand } from "./done.js";
import { checkbox } from "@inquirer/prompts";
import { SetTaskAsDoneUseCase } from "../../../application/useCases/commands/SetTaskAsDoneUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { Slug } from "../../../domain/valueObjects/Slug.js";

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    statSync: vi.fn().mockReturnValue({
      isFile: vi.fn().mockReturnValue(true),
    }),
    readFileSync: vi.fn().mockReturnValue(""),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
    basename: vi.fn((path) => path.split("/").pop()),
  },
}));

vi.mock("@inquirer/prompts", () => ({
  checkbox: vi.fn().mockResolvedValue([]),
}));

// Mock gray-matter
vi.mock("gray-matter", () => ({
  default: vi.fn().mockImplementation(() => ({
    data: { title: "Test Task", is_done: false },
    content: "Test content",
  })),
  stringify: vi
    .fn()
    .mockReturnValue(
      '---\ntitle: "Test Task"\nis_done: true\n---\n\nTest content'
    ),
}));

// Mock SetTaskAsDoneUseCase
vi.mock(
  "../../../application/useCases/commands/SetTaskAsDoneUseCase.js",
  () => ({
    SetTaskAsDoneUseCase: vi.fn().mockReturnValue({
      execute: vi.fn().mockResolvedValue({
        slug: { value: "test-task" },
        title: { value: "Test Task" },
        description: { value: "Test description" },
        isDone: true,
      }),
    }),
  })
);

// Mock FileSystemTaskRepository
vi.mock(
  "../../../infrastructure/repositories/FileSystemTaskRepository.js",
  () => ({
    FileSystemTaskRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn().mockResolvedValue([]),
      findBySlug: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
  })
);

describe("Done Command", () => {
  describe("Interactive Mode", () => {
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

      await doneCommand();

      expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
      expect(console.log).toHaveBeenCalledWith(
        "❌ Tasks directory does not exist. Run 'mtd init' first."
      );
    });

    it("should display a message when no undone tasks are found", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock repository to return empty array
      const mockFindAll = vi.fn().mockResolvedValueOnce([]);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      await doneCommand();

      expect(FileSystemTaskRepository).toHaveBeenCalledWith(tasksDir);
      expect(mockFindAll).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
    });

    it("should display a message when no tasks are selected", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "1"
      );

      const task2 = new Task(
        new Title("Task 2"),
        new Description("Description 2"),
        false,
        "2"
      );

      const tasks = [task1, task2];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock checkbox to return empty array (no tasks selected)
      vi.mocked(checkbox).mockResolvedValueOnce([]);

      await doneCommand();

      expect(checkbox).toHaveBeenCalledWith({
        message: "Select tasks to mark as done",
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: `${task1.title.value} (PENDING)`,
            value: task1.slug.value,
            message: `${task1.title.value} (PENDING)`,
          }),
          expect.objectContaining({
            name: `${task2.title.value} (PENDING)`,
            value: task2.slug.value,
            message: `${task2.title.value} (PENDING)`,
          }),
        ]),
      });

      expect(console.log).toHaveBeenCalledWith("❌ No tasks selected.");
    });

    it("should mark selected tasks as done", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "1"
      );

      const task2 = new Task(
        new Title("Task 2"),
        new Description("Description 2"),
        false,
        "2"
      );

      const tasks = [task1, task2];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      const mockFindBySlug = vi.fn().mockImplementation((slug) => {
        if (slug.value === task1.slug.value) return Promise.resolve(task1);
        if (slug.value === task2.slug.value) return Promise.resolve(task2);
        return Promise.resolve(null);
      });
      const mockSave = vi.fn().mockResolvedValue(undefined);

      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: mockFindBySlug,
        save: mockSave,
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock checkbox to return selected tasks
      vi.mocked(checkbox).mockResolvedValueOnce([
        task1.slug.value,
        task2.slug.value,
      ]);

      // Mock SetTaskAsDoneUseCase
      const mockExecute = vi.fn().mockImplementation((slug) => {
        if (slug.value === task1.slug.value) {
          task1.setAsDone();
          return Promise.resolve(task1);
        }
        if (slug.value === task2.slug.value) {
          task2.setAsDone();
          return Promise.resolve(task2);
        }
        return Promise.reject(new Error("Task not found"));
      });

      vi.mocked(SetTaskAsDoneUseCase).mockReturnValue({
        execute: mockExecute,
      } as unknown as SetTaskAsDoneUseCase);

      await doneCommand();

      // Verify use case was created with repository
      expect(SetTaskAsDoneUseCase).toHaveBeenCalledWith(expect.any(Object));

      // Verify use case was executed for each selected task
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: task1.slug.value })
      );
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: task2.slug.value })
      );

      // Verify console output
      expect(console.log).toHaveBeenCalledWith(
        `✅ Marked task as done: ${task1.title.value}`
      );
      expect(console.log).toHaveBeenCalledWith(
        `✅ Marked task as done: ${task2.title.value}`
      );
    });

    it("should handle errors when marking tasks as done", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "1"
      );

      const tasks = [task1];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock checkbox to return selected tasks
      vi.mocked(checkbox).mockResolvedValueOnce([task1.slug.value]);

      // Mock SetTaskAsDoneUseCase to throw an error
      const mockExecute = vi
        .fn()
        .mockRejectedValueOnce(new Error("Test error"));
      vi.mocked(SetTaskAsDoneUseCase).mockReturnValue({
        execute: mockExecute,
      } as unknown as SetTaskAsDoneUseCase);

      await doneCommand();

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: task1.slug.value })
      );
      expect(console.log).toHaveBeenCalledWith(
        "❌ Error marking task as done: 1-task-1",
        expect.any(Error)
      );
    });
  });

  describe("CLI Arguments Mode", () => {
    const mockCwd = "/mock/current/dir";
    const originalCwd = process.cwd;

    beforeEach(() => {
      process.cwd = vi.fn().mockReturnValue(mockCwd);
      vi.spyOn(console, "log");
      vi.clearAllMocks();
    });

    afterEach(() => {
      process.cwd = originalCwd;
    });

    it("should mark tasks as done when slugs are provided as arguments", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "task-1"
      );

      const task2 = new Task(
        new Title("Task 2"),
        new Description("Description 2"),
        false,
        "task-2"
      );

      const tasks = [task1, task2];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock SetTaskAsDoneUseCase
      const mockExecute = vi.fn().mockImplementation((slug: Slug) => {
        if (slug.value === "task-1") {
          task1.setAsDone();
          return Promise.resolve(task1);
        }
        if (slug.value === "task-2") {
          task2.setAsDone();
          return Promise.resolve(task2);
        }
        return Promise.reject(new Error("Task not found"));
      });

      vi.mocked(SetTaskAsDoneUseCase).mockReturnValue({
        execute: mockExecute,
      } as unknown as SetTaskAsDoneUseCase);

      // Call doneCommand with slug arguments
      await doneCommand(["task-1", "task-2"]);

      // Verify use case was created with repository
      expect(SetTaskAsDoneUseCase).toHaveBeenCalledWith(expect.any(Object));

      // Verify use case was executed for each provided slug
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: "task-1" })
      );
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: "task-2" })
      );

      // Verify console output
      expect(console.log).toHaveBeenCalledWith(
        `✅ Marked task as done: ${task1.title.value}`
      );
      expect(console.log).toHaveBeenCalledWith(
        `✅ Marked task as done: ${task2.title.value}`
      );

      // Verify checkbox was not called (since we're using CLI arguments)
      expect(checkbox).not.toHaveBeenCalled();
    });

    it("should handle errors when marking tasks as done via CLI arguments", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks - we need at least one task for the test to proceed past the "No tasks found" check
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "task-1"
      );
      const tasks = [task1];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock SetTaskAsDoneUseCase to throw an error
      const mockExecute = vi
        .fn()
        .mockRejectedValueOnce(new Error("Task not found"));
      vi.mocked(SetTaskAsDoneUseCase).mockReturnValue({
        execute: mockExecute,
      } as unknown as SetTaskAsDoneUseCase);

      // Call doneCommand with invalid slug
      await doneCommand(["invalid-slug"]);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({ value: "invalid-slug" })
      );
      expect(console.log).toHaveBeenCalledWith(
        "❌ Error marking task as done: invalid-slug",
        expect.any(Error)
      );
    });

    it("should fall back to interactive mode when no slugs are provided", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Create mock tasks
      const task1 = new Task(
        new Title("Task 1"),
        new Description("Description 1"),
        false,
        "task-1"
      );

      const tasks = [task1];

      // Mock repository to return tasks
      const mockFindAll = vi.fn().mockResolvedValueOnce(tasks);
      vi.mocked(FileSystemTaskRepository).mockReturnValueOnce({
        findAll: mockFindAll,
        findBySlug: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
      } as unknown as FileSystemTaskRepository);

      // Mock checkbox to return selected tasks
      vi.mocked(checkbox).mockResolvedValueOnce([task1.slug.value]);

      // Call doneCommand with no arguments
      await doneCommand([]);

      // Verify checkbox was called (since we're in interactive mode)
      expect(checkbox).toHaveBeenCalled();
    });
  });
});
