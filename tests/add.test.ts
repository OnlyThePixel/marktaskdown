import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { addCommand } from "../src/commands/add.js";

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
    vi.restoreAllMocks();
  });

  it("should check if tasks directory exists", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);

    addCommand("Test Task", {});

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(console.log).toHaveBeenCalledWith(
      "❌ Tasks directory does not exist. Run 'mtd init' first."
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should check if task already exists", () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // tasks directory exists
      .mockReturnValueOnce(true); // task file exists

    addCommand("Test Task", {});

    expect(fs.existsSync).toHaveBeenCalledWith(`${tasksDir}/test-task.md`);
    expect(console.log).toHaveBeenCalledWith(
      '❌ Task with title "Test Task" already exists.'
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should create a task with minimal information (title only)", () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // tasks directory exists
      .mockReturnValueOnce(false); // task file doesn't exist

    addCommand("Test Task", {});

    const expectedContent = [
      "---",
      "title: Test Task",
      "is_done: false",
      "---",
      "",
      "<!-- Add your task details here -->",
      "",
    ].join("\n");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${tasksDir}/test-task.md`,
      expectedContent
    );
    expect(console.log).toHaveBeenCalledWith("✅ Created task: Test Task");
    expect(console.log).toHaveBeenCalledWith("📝 File: test-task.md");
  });

  it("should create a task with description", () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // tasks directory exists
      .mockReturnValueOnce(false); // task file doesn't exist

    const options = {
      description: "This is a test task description",
    };

    addCommand("Complex Task", options);

    const expectedContent = [
      "---",
      "title: Complex Task",
      "is_done: false",
      "---",
      "",
      "This is a test task description",
      "",
    ].join("\n");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${tasksDir}/complex-task.md`,
      expectedContent
    );
  });

  it("should convert title to kebab-case for filename", () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // tasks directory exists
      .mockReturnValueOnce(false); // task file doesn't exist

    addCommand("This is a Complex Task! With @special# chars", {});

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${tasksDir}/this-is-a-complex-task-with-special-chars.md`,
      expect.any(String)
    );
  });
});
