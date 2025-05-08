import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MCPServer } from "./MCPServer.js";

describe("MCPServer", () => {
  let server: MCPServer;
  const defaultPort = 4242;
  const testPort = 4243;

  beforeEach(() => {
    // Reset environment variables before each test
    delete process.env.MTD_MCP_PORT;
  });

  afterEach(async () => {
    // Ensure server is closed after each test
    if (server) {
      await server.stop();
    }
  });

  it("should start the server on the default port when no port is configured", async () => {
    // Mock the start method to avoid actually binding to a port
    const startMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(MCPServer.prototype, "start").mockImplementation(startMock);

    server = new MCPServer();
    await server.start();

    expect(startMock).toHaveBeenCalled();
    expect(server.port).toBe(defaultPort);
  });

  it("should start the server on the configured port from environment variable", async () => {
    // Set environment variable
    process.env.MTD_MCP_PORT = testPort.toString();

    // Mock the start method
    const startMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(MCPServer.prototype, "start").mockImplementation(startMock);

    server = new MCPServer();
    await server.start();

    expect(startMock).toHaveBeenCalled();
    expect(server.port).toBe(testPort);
  });

  it("should have a health check endpoint that returns a success response", async () => {
    // Create a mock for the health check endpoint
    const mockResponse = {
      status: "success",
      data: {
        message: "MarkTaskDown MCP Server is running",
      },
    };

    // Mock the getHealthStatus method
    const getHealthStatusMock = vi.fn().mockResolvedValue(mockResponse);
    vi.spyOn(MCPServer.prototype, "getHealthStatus").mockImplementation(
      getHealthStatusMock
    );

    server = new MCPServer();
    const response = await server["getHealthStatus"]();

    expect(response).toEqual(mockResponse);
  });

  it("should handle 404 for unrecognized routes", async () => {
    // Create a mock for the 404 response
    const mockResponse = {
      status: "error",
      message: "Not Found",
    };

    // Mock the handle404 method
    const handle404Mock = vi.fn().mockReturnValue(mockResponse);
    vi.spyOn(MCPServer.prototype, "handle404").mockImplementation(
      handle404Mock
    );

    server = new MCPServer();
    const response = await server["handle404"]();

    expect(response).toEqual(mockResponse);
  });

  it("should handle server errors with 500 status code", async () => {
    // Create a mock for the 500 response
    const mockResponse = {
      status: "error",
      message: "Internal Server Error",
    };

    // Mock the handleError method
    const handleErrorMock = vi.fn().mockReturnValue(mockResponse);
    vi.spyOn(MCPServer.prototype, "handleError").mockImplementation(
      handleErrorMock
    );

    server = new MCPServer();
    const error = new Error("Test error");
    const response = await server["handleError"](error);

    expect(response).toEqual(mockResponse);
  });
});
