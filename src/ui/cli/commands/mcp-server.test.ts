import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { mcpServerCommand } from "./mcp-server.js";
import { MarkTaskDownMcpServer } from "../../../infrastructure/mcp/server.js";

// Mock the MCP server module
vi.mock("../../../infrastructure/mcp/server.js", () => {
  return {
    MarkTaskDownMcpServer: vi.fn().mockImplementation(() => ({
      start: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    })),
  };
});

// Mock console methods
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock process methods
const mockProcessExit = vi
  .spyOn(process, "exit")
  .mockImplementation(() => undefined as never);
const mockProcessOn = vi.spyOn(process, "on").mockImplementation(() => process);

describe("mcpServerCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should start the MCP server successfully", async () => {
    // Act
    await mcpServerCommand();

    // Assert
    expect(MarkTaskDownMcpServer).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Starting MarkTaskDown MCP Server..."
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "This will allow LLM applications to interact with your tasks."
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "MarkTaskDown MCP Server started with STDIO transport"
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "The server will continue running until you press Ctrl+C"
    );
    expect(mockProcessOn).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(mockProcessOn).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it("should handle errors when starting the server", async () => {
    // Arrange
    const mockError = new Error("Test error");
    vi.mocked(MarkTaskDownMcpServer).mockImplementationOnce(
      () =>
        ({
          start: vi.fn().mockRejectedValue(mockError),
          close: vi.fn(),
        }) as unknown as MarkTaskDownMcpServer
    );

    // Act
    await mcpServerCommand();

    // Assert
    expect(MarkTaskDownMcpServer).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error starting MarkTaskDown MCP Server: Test error"
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should handle non-Error objects when starting the server", async () => {
    // Arrange
    const mockError = "String error";
    vi.mocked(MarkTaskDownMcpServer).mockImplementationOnce(
      () =>
        ({
          start: vi.fn().mockRejectedValue(mockError),
          close: vi.fn(),
        }) as unknown as MarkTaskDownMcpServer
    );

    // Act
    await mcpServerCommand();

    // Assert
    expect(MarkTaskDownMcpServer).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error starting MarkTaskDown MCP Server: String error"
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
