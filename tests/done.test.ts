import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { doneCommand } from "../src/commands/done.js";
import { checkbox } from "@inquirer/prompts";

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

vi.mock("@inquirer/prompts", () => ({
  checkbox: vi.fn(),
}));

describe("Done Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;

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

    await doneCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
    expect(fs.readdirSync).not.toHaveBeenCalled();
  });

  it("should handle when no tasks are found", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    await doneCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
  });

  it("should handle when no undone tasks are found", async () => {
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

    // Mock readFileSync to return content with is_done: true
    vi.mocked(fs.readFileSync).mockReturnValueOnce(
      "---\ntitle: Task 1\nis_done: true\n---\n\nTask 1 description"
    );

    await doneCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith("📝 No undone tasks found.");
  });

  it("should successfully mark tasks as done", async () => {
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
        "---\ntitle: Task 2\nis_done: false\n---\n\nTask 2 description"
      )
      // Mock the second call to readFileSync for the selected task
      .mockReturnValueOnce(
        "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
      );

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["task-1.md"]);

    await doneCommand();

    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to mark as done",
      choices: [
        { name: "Task 1", value: "task-1.md" },
        { name: "Task 2", value: "task-2.md" },
      ],
    });

    // Check if writeFileSync was called with updated content
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${tasksDir}/task-1.md`,
      expect.stringContaining("is_done: true")
    );
    expect(console.log).toHaveBeenCalledWith("✅ Marked task as done: Task 1");
  });

  it("should serialize front matter with double quotes", async () => {
    // This test verifies that the done command uses double quotes for string values in front matter

    // Reset all mocks to ensure a clean state
    vi.resetAllMocks();

    // Re-mock process.cwd after reset
    process.cwd = vi.fn().mockReturnValue(mockCwd);

    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(
      () =>
        ({
          isFile: () => true,
        }) as fs.Stats
    );

    // Mock readFileSync for both calls
    const mockContent =
      '---\ntitle: "Task: 1"\nis_done: false\n---\n\nTask 1 description';
    vi.mocked(fs.readFileSync).mockImplementation(() => mockContent);

    // Mock checkbox to return the task
    vi.mocked(checkbox).mockResolvedValue(["task-1.md"]);

    // Execute the command
    await doneCommand();

    // Verify that writeFileSync was called with content containing double-quoted title
    expect(fs.writeFileSync).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(writeCall[0]).toBe(`${tasksDir}/task-1.md`);
    expect(writeCall[1]).toMatch(/title: "Task: 1"/);
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
      )
      // Mock the second call to readFileSync for the selected task
      .mockReturnValueOnce(
        "---\ntitle: Task 2\nis_done: false\n---\n\nTask 2 description"
      );

    // Mock checkbox to return selected tasks
    vi.mocked(checkbox).mockResolvedValueOnce(["task-2.md"]);

    await doneCommand();

    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Warning: Could not parse task file: invalid-task.md"
    );
    expect(checkbox).toHaveBeenCalledWith({
      message: "Select tasks to mark as done",
      choices: [{ name: "Task 2", value: "task-2.md" }],
    });
  });

  it("should handle empty selection when tasks are available", async () => {
    // Setup mocks
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

    // Mock readFileSync to return content with is_done: false
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
    );

    // Mock the checkbox function to return empty array
    vi.mocked(checkbox).mockResolvedValueOnce([]);

    await doneCommand();

    // Since we're mocking the entire implementation, we can't easily test
    // the exact behavior, so let's just verify no files were updated
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
