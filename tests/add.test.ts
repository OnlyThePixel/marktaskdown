import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { addCommand } from "../src/commands/add.js";
import { input, confirm } from "@inquirer/prompts";

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
  input: vi.fn(),
  confirm: vi.fn(),
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

  describe("Interactive Mode", () => {
    it("should enter interactive mode when no title is provided", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true); // tasks directory exists
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

      const expectedContent = [
        "---",
        "title: Interactive Task",
        "is_done: false",
        "---",
        "",
        "This is an interactive task",
        "",
      ].join("\n");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${tasksDir}/interactive-task.md`,
        expectedContent
      );

      expect(console.log).toHaveBeenCalledWith(
        "✅ Created task: Interactive Task"
      );
      expect(console.log).toHaveBeenCalledWith("📝 File: interactive-task.md");
    });

    it("should handle empty description in interactive mode", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true); // tasks directory exists
      vi.mocked(input)
        .mockResolvedValueOnce("Task Without Description") // Title prompt
        .mockResolvedValueOnce(""); // Empty description

      await addCommand();

      const expectedContent = [
        "---",
        "title: Task Without Description",
        "is_done: false",
        "---",
        "",
        "<!-- Add your task details here -->",
        "",
      ].join("\n");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${tasksDir}/task-without-description.md`,
        expectedContent
      );
    });

    it("should validate title is not empty", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true); // tasks directory exists

      // Setup the mock to test the validate function
      vi.mocked(input).mockImplementationOnce(async (options) => {
        // First call the validate function with empty string
        const validateResult = options.validate("");
        expect(validateResult).toBe("Title cannot be empty");

        // Then return a valid title
        return "Valid Title";
      });

      vi.mocked(input).mockResolvedValueOnce("Description"); // Description prompt

      await addCommand();

      expect(input).toHaveBeenCalledWith({
        message: "Enter task title:",
        validate: expect.any(Function),
      });
    });

    it("should check if file already exists and allow retry", async () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // tasks directory exists
        .mockReturnValueOnce(true) // First task file exists
        .mockReturnValueOnce(false); // Second task file doesn't exist

      vi.mocked(input)
        .mockResolvedValueOnce("Existing Task") // First title attempt
        .mockResolvedValueOnce("New Task") // Second title attempt
        .mockResolvedValueOnce("This is a new task"); // Description

      vi.mocked(confirm).mockResolvedValueOnce(true); // Yes, retry with different title

      await addCommand();

      expect(confirm).toHaveBeenCalledWith({
        message: "Would you like to enter a different title?",
        default: true,
      });

      const expectedContent = [
        "---",
        "title: New Task",
        "is_done: false",
        "---",
        "",
        "This is a new task",
        "",
      ].join("\n");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${tasksDir}/new-task.md`,
        expectedContent
      );
    });

    it("should cancel operation if user doesn't want to retry", async () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // tasks directory exists
        .mockReturnValueOnce(true); // Task file exists

      vi.mocked(input).mockResolvedValueOnce("Existing Task"); // Title attempt
      vi.mocked(confirm).mockResolvedValueOnce(false); // No, don't retry

      await addCommand();

      expect(console.log).toHaveBeenCalledWith("❌ Operation cancelled.");
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});
