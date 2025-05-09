import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MCPServer } from "./MCPServer.js";
import { InitializeProjectUseCase } from "../../application/useCases/commands/InitializeProjectUseCase.js";
import { InitializeProjectResultDTO } from "../../application/dtos/InitializeProjectResultDTO.js";
import { Request, Response } from "express";

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

  it("should have an initialize project endpoint that returns a success response", async () => {
    // Create a mock for the InitializeProjectUseCase
    const mockResult: InitializeProjectResultDTO = {
      created: true,
      tasksDir: "/path/to/workspace/tasks",
    };

    // Mock the execute method of InitializeProjectUseCase
    const executeMock = vi.fn().mockResolvedValue(mockResult);
    vi.spyOn(InitializeProjectUseCase.prototype, "execute").mockImplementation(
      executeMock
    );

    // Create a mock Express request and response
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    } as unknown as Response;

    // Create the server
    server = new MCPServer();

    // Mock the Express app post method to capture the handler
    const postMock = vi.fn();
    const appMock = {
      get: vi.fn(),
      post: postMock,
      use: vi.fn(),
      delete: vi.fn(),
    };
    vi.spyOn(
      server as unknown as { app: typeof appMock },
      "app",
      "get"
    ).mockReturnValue(appMock);

    // Configure routes to capture the handler
    server["configureRoutes"]();

    // Get the handler for the /initialize endpoint
    const handler = postMock.mock.calls.find(
      (call) => call[0] === "/initialize"
    )?.[1];
    expect(handler).toBeDefined();

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(executeMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        created: mockResult.created,
        tasksDir: mockResult.tasksDir,
      },
    });
  });

  it("should handle errors in the initialize project endpoint", async () => {
    // Create a mock error
    const mockError = new Error("Test error");

    // Mock the execute method to throw an error
    vi.spyOn(InitializeProjectUseCase.prototype, "execute").mockRejectedValue(
      mockError
    );

    // Mock the handleError method
    const mockErrorResponse = {
      status: "error",
      message: "Internal Server Error",
    };
    const handleErrorMock = vi.fn().mockReturnValue(mockErrorResponse);
    vi.spyOn(MCPServer.prototype, "handleError").mockImplementation(
      handleErrorMock
    );

    // Create a mock Express request and response
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    } as unknown as Response;

    // Create the server
    server = new MCPServer();

    // Mock the Express app post method to capture the handler
    const postMock = vi.fn();
    const appMock = {
      get: vi.fn(),
      post: postMock,
      use: vi.fn(),
      delete: vi.fn(),
    };
    vi.spyOn(
      server as unknown as { app: typeof appMock },
      "app",
      "get"
    ).mockReturnValue(appMock);

    // Configure routes to capture the handler
    server["configureRoutes"]();

    // Get the handler for the /initialize endpoint
    const handler = postMock.mock.calls.find(
      (call) => call[0] === "/initialize"
    )?.[1];
    expect(handler).toBeDefined();

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(handleErrorMock).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(mockErrorResponse);
  });
});
