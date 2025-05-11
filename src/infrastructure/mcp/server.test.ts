import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MarkTaskDownMcpServer } from "./server.js";

// Create mock functions
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockClose = vi.fn();
const mockTransportClose = vi.fn();

// Mock the modules
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    close: mockTransportClose,
  })),
}));

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
});
