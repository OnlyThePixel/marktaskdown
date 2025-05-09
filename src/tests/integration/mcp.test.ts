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
});
