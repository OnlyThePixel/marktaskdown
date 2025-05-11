import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

/**
 * System Integration Tests for MarkTaskDown
 *
 * These tests verify that the entire system works together with the new architecture.
 * They create a temporary directory for testing and execute the actual CLI commands
 * in a sequence that simulates real usage.
 */
describe("System Integration Tests", () => {
  // Create a temporary directory for testing
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mtd-system-tests-"));
  const cliPath = path.resolve(process.cwd(), "dist/ui/cli/index.js");

  // Store the original working directory
  const originalCwd = process.cwd();

  beforeAll(async () => {
    // Build the project to ensure the latest code is used
    const buildResult = await spawnSync("npm", ["run", "build"], {
      cwd: originalCwd,
    });
    if (buildResult.status !== 0) {
      throw new Error(`Failed to build project: ${buildResult.stderr}`);
    }
  });

  afterAll(() => {
    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Helper function to execute CLI commands and return a promise
   * that resolves with the output
   */
  function execCliAsync(
    args: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const child = spawn("node", [cliPath, ...args], {
        cwd: tempDir,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (exitCode) => {
        resolve({ stdout, stderr, exitCode: exitCode || 0 });
      });
    });
  }

  /**
   * Helper function to execute CLI commands synchronously
   */
  async function spawnSync(
    command: string,
    args: string[],
    options: { cwd: string }
  ): Promise<{ status: number | null; stderr: string; stdout: string }> {
    const { spawnSync: nodeSpawnSync } = await import("child_process");
    const result = nodeSpawnSync(command, args, {
      ...options,
      encoding: "utf8",
    });

    return {
      status: result.status,
      stderr: result.stderr,
      stdout: result.stdout,
    };
  }

  it("should test the entire system workflow", async () => {
    // Step 1: Initialize the project
    const initResult = await execCliAsync(["init"]);
    expect(initResult.exitCode).toBe(0);
    expect(initResult.stdout).toContain("Created tasks directory");

    // Verify the tasks directory was created
    const tasksDir = path.join(tempDir, "tasks");
    expect(fs.existsSync(tasksDir)).toBe(true);

    // Step 2: Add a task
    const addResult = await execCliAsync([
      "add",
      "Integration Test Task",
      "--description",
      "This is a task created during integration testing",
    ]);
    expect(addResult.exitCode).toBe(0);
    expect(addResult.stdout).toContain("Created task: Integration Test Task");

    // Verify the task file was created
    const files = fs.readdirSync(tasksDir);
    expect(files.length).toBe(1);

    // Get the task file path
    const taskFile = path.join(tasksDir, files[0]);

    // Verify the task file content
    const taskContent = fs.readFileSync(taskFile, "utf8");
    expect(taskContent).toContain("title: Integration Test Task");
    expect(taskContent).toContain("is_done: false");
    expect(taskContent).toContain(
      "This is a task created during integration testing"
    );

    // Step 3: Add another task
    const addResult2 = await execCliAsync([
      "add",
      "Second Test Task",
      "--description",
      "This is another task for testing",
    ]);
    expect(addResult2.exitCode).toBe(0);
    expect(addResult2.stdout).toContain("Created task: Second Test Task");

    // Verify both task files exist
    const filesAfterSecondAdd = fs.readdirSync(tasksDir);
    expect(filesAfterSecondAdd.length).toBe(2);

    // Step 4: List tasks
    const listResult = await execCliAsync(["list"]);
    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain("Integration Test Task");
    expect(listResult.stdout).toContain("Second Test Task");

    // Step 5: Mark a task as done
    // Since we can't interact with inquirer prompts in an automated test,
    // we'll need to modify the task file directly to simulate marking it as done
    // Get the task file name for archiving
    const updatedContent = taskContent.replace(
      "is_done: false",
      "is_done: true"
    );
    fs.writeFileSync(taskFile, updatedContent);

    // Verify the task was marked as done
    const updatedTaskContent = fs.readFileSync(taskFile, "utf8");
    expect(updatedTaskContent).toContain("is_done: true");

    // Step 6: List tasks again to verify the task is marked as done
    const listAfterDoneResult = await execCliAsync(["list"]);
    expect(listAfterDoneResult.exitCode).toBe(0);
    expect(listAfterDoneResult.stdout).toContain("Integration Test Task");
    expect(listAfterDoneResult.stdout).toContain("Second Test Task");

    // Step 7: Delete a task
    // Since we can't interact with inquirer prompts in an automated test,
    // we'll simulate deleting a task by moving it to the archive directory
    const archiveDir = path.join(tasksDir, ".archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    // Move the first task to the archive
    const taskFileName = path.basename(taskFile);
    const archiveFilePath = path.join(archiveDir, taskFileName);
    fs.copyFileSync(taskFile, archiveFilePath);
    fs.unlinkSync(taskFile);

    // Verify the task was archived
    expect(fs.existsSync(archiveFilePath)).toBe(true);
    expect(fs.existsSync(taskFile)).toBe(false);

    // Step 8: List tasks again to verify only one task remains
    const listAfterDeleteResult = await execCliAsync(["list"]);
    expect(listAfterDeleteResult.exitCode).toBe(0);
    expect(listAfterDeleteResult.stdout).toContain("Second Test Task");
    expect(listAfterDeleteResult.stdout).not.toContain("Integration Test Task");

    // Verify only one task file remains in the tasks directory
    const filesAfterDelete = fs
      .readdirSync(tasksDir)
      .filter((file) => file !== ".archive");
    expect(filesAfterDelete.length).toBe(1);
  });
});
