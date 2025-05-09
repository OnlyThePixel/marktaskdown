import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fetch from "node-fetch";
import { MCPServer } from "../../infrastructure/mcp/MCPServer.js";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * MCP Server Integration Tests
 *
 * These tests verify that the MCP server endpoints work correctly.
 * They start a real MCP server instance and make HTTP requests to it.
 */
describe("MCP Server Integration Tests", () => {
  let server: MCPServer;
  const testPort = 4244;

  // Create a temporary directory for testing
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mtd-mcp-tests-"));
  const originalCwd = process.cwd();

  beforeAll(async () => {
    // Change to the temporary directory
    process.chdir(tempDir);

    // Set environment variable for test port
    process.env.MTD_MCP_PORT = testPort.toString();

    // Create a real server instance
    server = new MCPServer();

    // Start the server
    await server.start();
  });

  afterAll(async () => {
    // Stop the server
    if (server) {
      await server.stop();
    }

    // Reset environment variables
    delete process.env.MTD_MCP_PORT;

    // Change back to the original directory
    process.chdir(originalCwd);

    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should have a health check endpoint", async () => {
    const response = await fetch(`http://localhost:${testPort}/health`);

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      status: "success",
      data: {
        message: "MarkTaskDown MCP Server is running",
      },
    });
  });

  it("should initialize a project when POST /initialize is called", async () => {
    // Make a request to the initialize endpoint
    const response = await fetch(`http://localhost:${testPort}/initialize`, {
      method: "POST",
    });

    // Verify the response status
    expect(response.status).toBe(200);

    // Verify the response body
    const responseBody = (await response.json()) as {
      status: string;
      data: {
        created: boolean;
        tasksDir: string;
      };
    };

    expect(responseBody.status).toBe("success");
    expect(responseBody.data).toBeDefined();
    expect(typeof responseBody.data.created).toBe("boolean");
    expect(typeof responseBody.data.tasksDir).toBe("string");

    // Verify the tasks directory was created
    const tasksDir = path.resolve(tempDir, "tasks");
    expect(fs.existsSync(tasksDir)).toBe(true);

    // Make another request to verify created is false when directory already exists
    const secondResponse = await fetch(
      `http://localhost:${testPort}/initialize`,
      {
        method: "POST",
      }
    );

    expect(secondResponse.status).toBe(200);

    const secondResponseBody = (await secondResponse.json()) as {
      status: string;
      data: {
        created: boolean;
        tasksDir: string;
      };
    };

    expect(secondResponseBody.status).toBe("success");
    expect(secondResponseBody.data.created).toBe(false);
  });

  it("should create a task when POST /tasks is called with valid data", async () => {
    // Make a request to the tasks endpoint with valid data
    const response = await fetch(`http://localhost:${testPort}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Task",
        description: "This is a test task created via MCP",
      }),
    });

    // Verify the response status
    expect(response.status).toBe(201);

    // Verify the response body
    const responseBody = (await response.json()) as {
      status: string;
      data: {
        id: string;
        slug: string;
        title: string;
        description: string;
        isDone: boolean;
      };
    };

    expect(responseBody.status).toBe("success");
    expect(responseBody.data).toBeDefined();
    expect(typeof responseBody.data.id).toBe("string");
    expect(typeof responseBody.data.slug).toBe("string");
    expect(responseBody.data.title).toBe("Test Task");
    expect(responseBody.data.description).toBe(
      "This is a test task created via MCP"
    );
    expect(responseBody.data.isDone).toBe(false);

    // Verify the task file was created
    const taskFilePath = path.resolve(
      tempDir,
      "tasks",
      `${responseBody.data.slug}.md`
    );
    expect(fs.existsSync(taskFilePath)).toBe(true);
  });

  it("should create a task when POST /tasks is called with only title", async () => {
    // Make a request to the tasks endpoint with only title
    const response = await fetch(`http://localhost:${testPort}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Task Without Description",
      }),
    });

    // Verify the response status
    expect(response.status).toBe(201);

    // Verify the response body
    const responseBody = (await response.json()) as {
      status: string;
      data: {
        id: string;
        slug: string;
        title: string;
        description: string;
        isDone: boolean;
      };
    };

    expect(responseBody.status).toBe("success");
    expect(responseBody.data).toBeDefined();
    expect(responseBody.data.title).toBe("Task Without Description");
    expect(responseBody.data.description).toBe("");
    expect(responseBody.data.isDone).toBe(false);
  });

  it("should return 400 when POST /tasks is called without title", async () => {
    // Make a request to the tasks endpoint without title
    const response = await fetch(`http://localhost:${testPort}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "This task has no title",
      }),
    });

    // Verify the response status
    expect(response.status).toBe(400);

    // Verify the response body
    const responseBody = (await response.json()) as {
      status: string;
      message: string;
    };

    expect(responseBody.status).toBe("error");
    expect(responseBody.message).toBeDefined();
  });

  it("should return 400 when POST /tasks is called with empty title", async () => {
    // Make a request to the tasks endpoint with empty title
    const response = await fetch(`http://localhost:${testPort}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "",
        description: "This task has empty title",
      }),
    });

    // Verify the response status
    expect(response.status).toBe(400);

    // Verify the response body
    const responseBody = (await response.json()) as {
      status: string;
      message: string;
    };

    expect(responseBody.status).toBe("error");
    expect(responseBody.message).toBeDefined();
  });
});
