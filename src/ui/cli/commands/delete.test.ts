import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { deleteCommand } from "./delete.js";
import { checkbox, confirm } from "@inquirer/prompts";

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

describe("Delete Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;
  const archiveDir = `${tasksDir}/.archive`;

  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.spyOn(console, "log");
    vi.spyOn(console, "warn");
    vi.clearAllMocks();
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
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    await deleteCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
  });

  it("should list all tasks regardless of status", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
      "task-2.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return different content for each file
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(
        "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
      )
      .mockReturnValueOnce(
        "---\ntitle: Task 2\nis_done: true\n---\n\nTask 2 description"
      );

    // Mock checkbox to return empty array to exit early
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to delete",
      choices: [
        { name: "Task 1 (PENDING)", value: "task-1.md" },
        { name: "Task 2 (DONE)", value: "task-2.md" },
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

  it("should successfully archive selected tasks", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
      "task-2.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return different content for each file
    const task1Content =
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description";
    const task2Content =
      "---\ntitle: Task 2\nis_done: true\n---\n\nTask 2 description";

    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(task1Content)
      .mockReturnValueOnce(task2Content)
      // Mock the second call to readFileSync for the selected tasks
      .mockReturnValueOnce(task1Content)
      .mockReturnValueOnce(task2Content);

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["task-1.md", "task-2.md"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    await deleteCommand();

    // Check if files were written to archive
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${archiveDir}/task-1.md`,
      task1Content
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${archiveDir}/task-2.md`,
      task2Content
    );

    // Check if original files were deleted
    expect(fs.unlinkSync).toHaveBeenCalledWith(`${tasksDir}/task-1.md`);
    expect(fs.unlinkSync).toHaveBeenCalledWith(`${tasksDir}/task-2.md`);

    // Check success messages
    expect(console.log).toHaveBeenCalledWith("🗑️ Archived task: Task 1");
    expect(console.log).toHaveBeenCalledWith("🗑️ Archived task: Task 2");
  });

  it("should handle invalid files", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "invalid-task.md",
      "task-2.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return invalid content for first file and valid for second
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce("Not a valid YAML front-matter")
      .mockReturnValueOnce(
        "---\ntitle: Task 2\nis_done: false\n---\n\nTask 2 description"
      );

    // Mock checkbox to return empty array to exit early
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await deleteCommand();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Warning: Could not parse task file: invalid-task.md"
    );
    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to delete",
      choices: [{ name: "Task 2 (PENDING)", value: "task-2.md" }],
    });
  });

  it("should handle errors when archiving tasks", async () => {
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
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(
        "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
      )
      .mockReturnValueOnce(
        "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
      );

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["task-1.md"]);

    // Mock confirm to return true (proceed)
    vi.mocked(confirm).mockResolvedValueOnce(true);

    // Mock writeFileSync to throw an error
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error("Mock file write error");
    });

    await deleteCommand();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Error archiving task file: task-1.md",
      expect.any(Error)
    );
  });
});
