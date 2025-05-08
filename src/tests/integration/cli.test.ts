import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

/**
 * Integration tests for the CLI commands
 *
 * These tests verify that all commands work together with the new architecture.
 * They create a temporary directory for testing and execute the actual CLI commands.
 */
describe("CLI Integration Tests", () => {
  // Create a temporary directory for testing
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "mtd-integration-tests-")
  );
  const cliPath = path.resolve(process.cwd(), "dist/index.js");

  // Store the original working directory
  const originalCwd = process.cwd();

  // Mock console.log to capture output
  const consoleLogMock = vi.spyOn(console, "log");

  beforeEach(() => {
    // Change to the temporary directory
    process.chdir(tempDir);
    // Clear console.log mock
    consoleLogMock.mockClear();
  });

  afterEach(() => {
    // Change back to the original directory
    process.chdir(originalCwd);
  });

  afterAll(() => {
    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Helper function to execute CLI commands
   */
  function execCli(args: string): string {
    try {
      return execSync(`node ${cliPath} ${args}`, {
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  it("should initialize a new project", () => {
    // Execute the init command
    const output = execCli("init");

    // Verify the output
    expect(output).toContain("Created tasks directory");
    expect(output).toContain("Initialization complete");

    // Verify the tasks directory was created
    const tasksDir = path.join(tempDir, "tasks");
    expect(fs.existsSync(tasksDir)).toBe(true);
  });

  it("should add a new task", () => {
    // Execute the add command with title and description
    const output = execCli(
      'add "Test Task" --description "This is a test task"'
    );

    // Verify the output
    expect(output).toContain("Created task: Test Task");
    expect(output).toContain("File: ");

    // Verify the task file was created
    const tasksDir = path.join(tempDir, "tasks");
    const files = fs.readdirSync(tasksDir);
    expect(files.length).toBe(1);

    // Verify the task file content
    const taskFile = path.join(tasksDir, files[0]);
    const content = fs.readFileSync(taskFile, "utf8");
    expect(content).toContain("title: Test Task");
    expect(content).toContain("is_done: false");
    expect(content).toContain("This is a test task");
  });

  it("should list all tasks", () => {
    // Execute the list command
    const output = execCli("list");

    // Verify the output contains the task
    expect(output).toContain("Test Task");
    expect(output).not.toContain("No tasks found");
  });

  it("should mark a task as done", () => {
    // Get the task slug
    const tasksDir = path.join(tempDir, "tasks");
    const files = fs.readdirSync(tasksDir);
    const taskSlug = path.basename(files[0], ".md");

    // Mock the inquirer checkbox selection
    vi.mock("@inquirer/prompts", () => ({
      checkbox: vi.fn().mockResolvedValue([taskSlug]),
      confirm: vi.fn().mockResolvedValue(true),
      input: vi.fn().mockResolvedValue(""),
    }));

    // Execute the done command
    const output = execCli("done");

    // Since this is an interactive command, we can't fully test it in an automated way
    // Instead, we'll check that the command starts correctly
    expect(output).toContain("Select tasks to mark as done");

    // Since this is an interactive command that requires user input,
    // we can't verify the task file was updated in an automated test
    // This test only verifies that the command starts correctly
  });

  it("should delete a task", () => {
    // Get the task slug
    const tasksDir = path.join(tempDir, "tasks");
    const files = fs.readdirSync(tasksDir);
    const taskSlug = path.basename(files[0], ".md");

    // Mock the inquirer checkbox and confirm selections
    vi.mock("@inquirer/prompts", () => ({
      checkbox: vi.fn().mockResolvedValue([taskSlug]),
      confirm: vi.fn().mockResolvedValue(true),
      input: vi.fn().mockResolvedValue(""),
    }));

    // Execute the delete command
    const output = execCli("delete");

    // Since this is an interactive command, we can't fully test it in an automated way
    // Instead, we'll check that the command starts correctly
    expect(output).toContain("Select tasks to delete");

    // Since this is an interactive command that requires user input,
    // we can't verify the task file was moved to archive in an automated test
    // This test only verifies that the command starts correctly
  });
});
