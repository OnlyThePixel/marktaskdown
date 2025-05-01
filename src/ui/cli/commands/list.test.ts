import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { listCommand } from "./list.js";
import { GetAllTasksUseCase } from "../../../application/useCases/queries/GetAllTasksUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { Title } from "../../../domain/valueObjects/Title.js";
import { Description } from "../../../domain/valueObjects/Description.js";
import { render } from "ink";
import React from "react";

// Mock dependencies
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

vi.mock("ink", () => ({
  render: vi.fn(),
}));

// Mock GetAllTasksUseCase
vi.mock("../../../application/useCases/queries/GetAllTasksUseCase.js", () => ({
  GetAllTasksUseCase: vi.fn().mockReturnValue({
    execute: vi.fn(),
  }),
}));

// Mock FileSystemTaskRepository
vi.mock(
  "../../../infrastructure/repositories/FileSystemTaskRepository.js",
  () => ({
    FileSystemTaskRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
    })),
  })
);

// Mock React
vi.mock("react", () => ({
  default: {
    createElement: vi.fn(),
  },
}));

// Mock Table component
vi.mock("../../Table.js", () => ({
  Table: vi.fn(),
}));

describe("List Command", () => {
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

    await listCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
  });

  it("should display a message when no tasks are found", async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);

    // Mock GetAllTasksUseCase to return empty array
    const mockExecute = vi.fn().mockResolvedValueOnce([]);
    vi.mocked(GetAllTasksUseCase).mockReturnValueOnce({
      execute: mockExecute,
    } as unknown as GetAllTasksUseCase);

    await listCommand();

    expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
    expect(render).not.toHaveBeenCalled();
  });

  it("should render a table with tasks", async () => {
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
      true,
      "2"
    );

    const tasks = [task1, task2];

    // Mock GetAllTasksUseCase to return tasks
    const mockExecute = vi.fn().mockResolvedValueOnce(tasks);
    vi.mocked(GetAllTasksUseCase).mockReturnValueOnce({
      execute: mockExecute,
    } as unknown as GetAllTasksUseCase);

    await listCommand();

    // Verify repository was created with correct path
    expect(FileSystemTaskRepository).toHaveBeenCalledWith(tasksDir);

    // Verify use case was created with repository
    expect(GetAllTasksUseCase).toHaveBeenCalledWith(expect.any(Object));

    // Verify use case was executed
    expect(mockExecute).toHaveBeenCalled();

    // Verify render was called with Table component
    expect(React.createElement).toHaveBeenCalledWith(expect.anything(), {
      data: [
        {
          slug: task1.slug.value,
          title: task1.title.value,
          status: "PENDING",
        },
        {
          slug: task2.slug.value,
          title: task2.title.value,
          status: "DONE",
        },
      ],
    });
    expect(render).toHaveBeenCalled();
  });
});
