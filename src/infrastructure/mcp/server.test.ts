import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MarkTaskDownMcpServer } from "./server.js";
import { InitializeProjectUseCase } from "../../application/useCases/commands/InitializeProjectUseCase.js";

// Create mock functions
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockClose = vi.fn();
const mockTransportClose = vi.fn();
const mockTool = vi.fn();

// Mock the modules
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    tool: mockTool,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    close: mockTransportClose,
  })),
}));

// Mock the InitializeProjectUseCase
vi.mock("../../application/useCases/commands/InitializeProjectUseCase.js");

describe("MarkTaskDownMcpServer", () => {
  let server: MarkTaskDownMcpServer;

  // Mock console methods to avoid cluttering test output
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    server = new MarkTaskDownMcpServer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create an instance of MarkTaskDownMcpServer", () => {
    expect(server).toBeInstanceOf(MarkTaskDownMcpServer);
  });

  it("should start and close the server", async () => {
    // Test start method
    await server.start();
    expect(mockConnect).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      "MarkTaskDown MCP Server started with STDIO transport"
    );

    // Test close method
    server.close();
    expect(mockClose).toHaveBeenCalled();
    expect(mockTransportClose).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("MarkTaskDown MCP Server closed");
  });

  it("should handle errors when starting the server", async () => {
    // Set up mock to throw error
    mockConnect.mockRejectedValueOnce(new Error("Connection error"));

    // Test start method with error
    await expect(server.start()).rejects.toThrow("Connection error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed to start MarkTaskDown MCP Server",
      expect.any(Error)
    );
  });

  it("should handle errors when closing the server", () => {
    // Set up mock to throw error
    mockClose.mockImplementationOnce(() => {
      throw new Error("Close error");
    });

    // Test close method with error
    server.close();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to close MarkTaskDown MCP Server",
      expect.any(Error)
    );
  });

  describe("registerTools", () => {
    it("should register the initialize-project tool", () => {
      // Verify that the tool method was called with the correct name
      expect(mockTool).toHaveBeenCalledWith(
        "initialize-project",
        expect.any(Object),
        expect.any(Function)
      );
    });

    it("should handle successful project initialization", async () => {
      // Setup mock implementation for InitializeProjectUseCase
      const mockExecute = vi.fn().mockResolvedValue({
        created: true,
        tasksDir: "/path/to/tasks",
      });

      vi.mocked(InitializeProjectUseCase).mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as unknown as InitializeProjectUseCase
      );

      // Extract the handler function from the tool registration
      const toolCall = mockTool.mock.calls.find(
        (call) => call[0] === "initialize-project"
      );

      // Ensure the tool was registered
      expect(toolCall).toBeDefined();
      const toolHandler = toolCall![2];

      // Call the handler
      const result = await toolHandler();

      // Verify the result
      expect(result).toEqual({
        content: [
          { type: "text", text: "Project initialized at /path/to/tasks" },
        ],
      });
    });

    it("should handle already initialized project", async () => {
      // Setup mock implementation for InitializeProjectUseCase
      const mockExecute = vi.fn().mockResolvedValue({
        created: false,
        tasksDir: "/path/to/tasks",
      });

      vi.mocked(InitializeProjectUseCase).mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as unknown as InitializeProjectUseCase
      );

      // Extract the handler function from the tool registration
      const toolCall = mockTool.mock.calls.find(
        (call) => call[0] === "initialize-project"
      );

      // Ensure the tool was registered
      expect(toolCall).toBeDefined();
      const toolHandler = toolCall![2];

      // Call the handler
      const result = await toolHandler();

      // Verify the result
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Project already initialized at /path/to/tasks",
          },
        ],
      });
    });

    it("should handle errors during project initialization", async () => {
      // Setup mock implementation for InitializeProjectUseCase to throw an error
      const mockExecute = vi
        .fn()
        .mockRejectedValue(new Error("Initialization failed"));

      vi.mocked(InitializeProjectUseCase).mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as unknown as InitializeProjectUseCase
      );

      // Extract the handler function from the tool registration
      const toolCall = mockTool.mock.calls.find(
        (call) => call[0] === "initialize-project"
      );

      // Ensure the tool was registered
      expect(toolCall).toBeDefined();
      const toolHandler = toolCall![2];

      // Call the handler
      const result = await toolHandler();

      // Verify the result
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Error initializing project: Initialization failed",
          },
        ],
        isError: true,
      });
    });
  });
});
