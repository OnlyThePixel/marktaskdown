import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { listCommand } from "./list.js";

vi.mock("fs", () => ({
  default: {
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    statSync: vi.fn(),
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

vi.mock("../src/ui/Table.js", () => ({
  Table: vi.fn(),
}));

describe("List Command", () => {
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

  it("should check if tasks directory exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    listCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
    expect(fs.readdirSync).not.toHaveBeenCalled();
  });

  it("should handle empty tasks directory", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    listCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith("📝 No tasks found.");
  });

  it("should list all tasks with their status", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "task-1.md",
      "task-2.md",
      "not-a-markdown-file.txt",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation((path) => {
      return {
        isFile: () => String(path).endsWith(".md"),
      } as fs.Stats;
    });

    // Mock readFileSync to return different content for each file
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(
        Buffer.from(
          "---\ntitle: Task 1\nis_done: false\n---\n\nTask 1 description"
        )
      )
      .mockReturnValueOnce(
        Buffer.from(
          "---\ntitle: Task 2\nis_done: true\n---\n\nTask 2 description"
        )
      );

    listCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    expect(fs.readFileSync).toHaveBeenCalledWith(
      `${tasksDir}/task-1.md`,
      "utf8"
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(
      `${tasksDir}/task-2.md`,
      "utf8"
    );
  });

  it("should handle invalid YAML front-matter", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      "invalid-task.md",
    ] as unknown as fs.Dirent[]);

    // Mock statSync to return an object with isFile method
    vi.mocked(fs.statSync).mockImplementation(() => {
      return {
        isFile: () => true,
      } as fs.Stats;
    });

    // Mock readFileSync to return invalid YAML
    vi.mocked(fs.readFileSync).mockReturnValueOnce(
      Buffer.from("Not a valid YAML front-matter")
    );

    listCommand();

    expect(fs.readdirSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.readFileSync).toHaveBeenCalledWith(
      `${tasksDir}/invalid-task.md`,
      "utf8"
    );
    expect(console.warn).toHaveBeenCalledWith(
      "⚠️ Warning: Could not parse task file: invalid-task.md"
    );
  });
});
