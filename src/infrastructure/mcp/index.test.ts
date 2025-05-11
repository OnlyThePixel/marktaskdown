import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MarkTaskDownMcpServer } from "./server.js";

// Mock the server module
vi.mock("./server.js", () => ({
  MarkTaskDownMcpServer: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  })),
}));

// Mock process methods and properties
const processExitMock = vi.fn();
const processOnMock = vi.fn();

const originalProcessExit = process.exit;
const originalProcessOn = process.on;

describe("MCP Server Entry Point", () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Setup process mocks
    process.exit = processExitMock as unknown as typeof process.exit;
    process.on = processOnMock as unknown as typeof process.on;

    // Setup fake timers
    vi.useFakeTimers();

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process methods
    process.exit = originalProcessExit;
    process.on = originalProcessOn;

    // Clear module cache to allow re-importing
    vi.resetModules();
    vi.useRealTimers();

    // Restore console mocks
    vi.restoreAllMocks();
  });

  it("should register signal handlers for graceful shutdown", async () => {
    // Import the module to trigger the code execution
    await import("./index.js");

    // Verify signal handlers were registered
    expect(processOnMock).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(processOnMock).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("should handle server initialization errors", async () => {
    // Create a promise that resolves when process.exit is called
    const exitPromise = new Promise<void>((resolve) => {
      processExitMock.mockImplementationOnce(() => {
        resolve();
        return undefined as never;
      });
    });

    // Mock server start to throw an error
    const mockError = new Error("Initialization failed");
    vi.mocked(MarkTaskDownMcpServer).mockImplementationOnce(
      () =>
        ({
          start: vi.fn().mockRejectedValue(mockError),
          close: vi.fn(),
        }) as unknown as MarkTaskDownMcpServer
    );

    // Import the module to trigger the code execution
    await import("./index.js");

    // Wait for process.exit to be called
    await exitPromise;

    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      "Error starting MarkTaskDown MCP Server: Initialization failed"
    );
    expect(processExitMock).toHaveBeenCalledWith(1);
  }, 10000);

  it("should handle shutdown signals", async () => {
    // Create a mock for the server
    const mockServer = {
      start: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };

    vi.mocked(MarkTaskDownMcpServer).mockImplementationOnce(
      () => mockServer as unknown as MarkTaskDownMcpServer
    );

    // Store the signal handlers
    const signalHandlers: Record<string, () => void> = {};
    processOnMock.mockImplementation((signal: string, handler: () => void) => {
      signalHandlers[signal] = handler;
      return process;
    });

    // Import the module to trigger the code execution
    await import("./index.js");

    // Simulate SIGINT signal
    if (signalHandlers["SIGINT"]) {
      signalHandlers["SIGINT"]();
    }

    // Verify shutdown behavior
    expect(console.log).toHaveBeenCalledWith(
      "Shutting down MarkTaskDown MCP Server..."
    );
    expect(mockServer.close).toHaveBeenCalled();
    expect(processExitMock).toHaveBeenCalledWith(0);
  });
});
