import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MarkTaskDownMcpServer } from "./server.js";
import { InitializeProjectUseCase } from "../../application/useCases/commands/InitializeProjectUseCase.js";
import { CreateTaskUseCase } from "../../application/useCases/commands/CreateTaskUseCase.js";
import { SetTaskAsDoneUseCase } from "../../application/useCases/commands/SetTaskAsDoneUseCase.js";
import { SetTaskAsUndoneUseCase } from "../../application/useCases/commands/SetTaskAsUndoneUseCase.js";
import { DeleteTaskUseCase } from "../../application/useCases/commands/DeleteTaskUseCase.js";
import { FileSystemTaskRepository } from "../../infrastructure/repositories/FileSystemTaskRepository.js";
import { GetAllTasksUseCase } from "../../application/useCases/queries/GetAllTasksUseCase.js";

// Create mock functions
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockClose = vi.fn();
const mockTransportClose = vi.fn();
const mockTool = vi.fn();
const mockResource = vi.fn();

// Mock the modules
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    tool: mockTool,
    resource: mockResource,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    close: mockTransportClose,
  })),
}));

// Mock the use cases
vi.mock("../../application/useCases/commands/InitializeProjectUseCase.js");
vi.mock("../../application/useCases/commands/CreateTaskUseCase.js");
vi.mock("../../application/useCases/commands/SetTaskAsDoneUseCase.js");
vi.mock("../../application/useCases/commands/SetTaskAsUndoneUseCase.js");
vi.mock("../../application/useCases/commands/DeleteTaskUseCase.js");
vi.mock("../../application/useCases/queries/GetAllTasksUseCase.js");

// Mock the repositories
vi.mock("../../infrastructure/repositories/FileSystemTaskRepository.js");

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
    describe("initialize-project tool", () => {
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

    describe("create-task tool", () => {
      it("should register the create-task tool", () => {
        // Verify that the tool method was called with the correct name
        expect(mockTool).toHaveBeenCalledWith(
          "create-task",
          expect.any(Object),
          expect.any(Function)
        );
      });

      it("should handle successful task creation", async () => {
        // Create mock task
        const mockTask = {
          title: { value: "Test Task" },
          description: { value: "Test Description" },
          slug: { value: "1-test-task" },
          isDone: false,
        };

        // Setup mock implementation for CreateTaskUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTask);

        // Mock the FileSystemTaskRepository constructor
        vi.mocked(FileSystemTaskRepository).mockImplementation(
          () => ({}) as unknown as FileSystemTaskRepository
        );

        // Mock the CreateTaskUseCase
        vi.mocked(CreateTaskUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as CreateTaskUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "create-task"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler with parameters
        const result = await toolHandler({
          title: "Test Task",
          description: "Test Description",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            { type: "text", text: "Task created: Test Task (1-test-task)" },
          ],
        });

        // Verify the use case was called with the correct parameters
        expect(mockExecute).toHaveBeenCalledWith({
          title: "Test Task",
          description: "Test Description",
        });
      });

      it("should handle task creation with default empty description", async () => {
        // Create mock task
        const mockTask = {
          title: { value: "Test Task" },
          description: { value: "" },
          slug: { value: "1-test-task" },
          isDone: false,
        };

        // Setup mock implementation for CreateTaskUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTask);

        // Mock the CreateTaskUseCase
        vi.mocked(CreateTaskUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as CreateTaskUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "create-task"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler with only title parameter
        const result = await toolHandler({
          title: "Test Task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            { type: "text", text: "Task created: Test Task (1-test-task)" },
          ],
        });

        // Verify the use case was called with the correct parameters
        expect(mockExecute).toHaveBeenCalledWith({
          title: "Test Task",
          description: "",
        });
      });

      it("should handle errors during task creation", async () => {
        // Setup mock implementation for CreateTaskUseCase to throw an error
        const mockExecute = vi
          .fn()
          .mockRejectedValue(new Error("Task creation failed"));

        // Mock the CreateTaskUseCase
        vi.mocked(CreateTaskUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as CreateTaskUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "create-task"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler
        const result = await toolHandler({
          title: "Test Task",
          description: "Test Description",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Error creating task: Task creation failed",
            },
          ],
          isError: true,
        });
      });
    });

    describe("set-task-done tool", () => {
      it("should register the set-task-done tool", () => {
        // Verify that the tool method was called with the correct name
        expect(mockTool).toHaveBeenCalledWith(
          "set-task-done",
          expect.any(Object),
          expect.any(Function)
        );
      });

      it("should handle successful task marking as done", async () => {
        // Create mock task
        const mockTask = {
          title: { value: "Test Task" },
          description: { value: "Test Description" },
          slug: { value: "1-test-task" },
          isDone: true,
        };

        // Setup mock implementation for SetTaskAsDoneUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTask);

        // Mock the FileSystemTaskRepository constructor
        vi.mocked(FileSystemTaskRepository).mockImplementation(
          () => ({}) as unknown as FileSystemTaskRepository
        );

        // Mock the SetTaskAsDoneUseCase
        vi.mocked(SetTaskAsDoneUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as SetTaskAsDoneUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "set-task-done"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler with parameters
        const result = await toolHandler({
          slug: "1-test-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Task marked as done: Test Task (1-test-task)",
            },
          ],
        });

        // Verify the use case was called with the correct parameters
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Object));
      });

      it("should handle errors during task marking as done", async () => {
        // Setup mock implementation for SetTaskAsDoneUseCase to throw an error
        const mockExecute = vi
          .fn()
          .mockRejectedValue(new Error("Task not found"));

        // Mock the SetTaskAsDoneUseCase
        vi.mocked(SetTaskAsDoneUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as SetTaskAsDoneUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "set-task-done"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler
        const result = await toolHandler({
          slug: "non-existent-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Error marking task as done: Task not found",
            },
          ],
          isError: true,
        });
      });
    });

    describe("set-task-undone tool", () => {
      it("should register the set-task-undone tool", () => {
        // Verify that the tool method was called with the correct name
        expect(mockTool).toHaveBeenCalledWith(
          "set-task-undone",
          expect.any(Object),
          expect.any(Function)
        );
      });

      it("should handle successful task marking as undone", async () => {
        // Create mock task
        const mockTask = {
          title: { value: "Test Task" },
          description: { value: "Test Description" },
          slug: { value: "1-test-task" },
          isDone: false,
        };

        // Setup mock implementation for SetTaskAsUndoneUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTask);

        // Mock the FileSystemTaskRepository constructor
        vi.mocked(FileSystemTaskRepository).mockImplementation(
          () => ({}) as unknown as FileSystemTaskRepository
        );

        // Mock the SetTaskAsUndoneUseCase
        vi.mocked(SetTaskAsUndoneUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as SetTaskAsUndoneUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "set-task-undone"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler with parameters
        const result = await toolHandler({
          slug: "1-test-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Task marked as undone: Test Task (1-test-task)",
            },
          ],
        });

        // Verify the use case was called with the correct parameters
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Object));
      });

      it("should handle errors during task marking as undone", async () => {
        // Setup mock implementation for SetTaskAsUndoneUseCase to throw an error
        const mockExecute = vi
          .fn()
          .mockRejectedValue(new Error("Task not found"));

        // Mock the SetTaskAsUndoneUseCase
        vi.mocked(SetTaskAsUndoneUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as SetTaskAsUndoneUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "set-task-undone"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler
        const result = await toolHandler({
          slug: "non-existent-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Error marking task as undone: Task not found",
            },
          ],
          isError: true,
        });
      });
    });

    describe("delete-task tool", () => {
      it("should register the delete-task tool", () => {
        // Verify that the tool method was called with the correct name
        expect(mockTool).toHaveBeenCalledWith(
          "delete-task",
          expect.any(Object),
          expect.any(Function)
        );
      });

      it("should handle successful task deletion", async () => {
        // Create mock task
        const mockTask = {
          title: { value: "Test Task" },
          description: { value: "Test Description" },
          slug: { value: "1-test-task" },
          isDone: false,
        };

        // Setup mock implementation for DeleteTaskUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTask);

        // Mock the FileSystemTaskRepository constructor
        vi.mocked(FileSystemTaskRepository).mockImplementation(
          () => ({}) as unknown as FileSystemTaskRepository
        );

        // Mock the DeleteTaskUseCase
        vi.mocked(DeleteTaskUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as DeleteTaskUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "delete-task"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler with parameters
        const result = await toolHandler({
          slug: "1-test-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Task deleted: Test Task (1-test-task)",
            },
          ],
        });

        // Verify the use case was called with the correct parameters
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Object));
      });

      it("should handle errors during task deletion", async () => {
        // Setup mock implementation for DeleteTaskUseCase to throw an error
        const mockExecute = vi
          .fn()
          .mockRejectedValue(new Error("Task not found"));

        // Mock the DeleteTaskUseCase
        vi.mocked(DeleteTaskUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as DeleteTaskUseCase
        );

        // Extract the handler function from the tool registration
        const toolCall = mockTool.mock.calls.find(
          (call) => call[0] === "delete-task"
        );

        // Ensure the tool was registered
        expect(toolCall).toBeDefined();
        const toolHandler = toolCall![2];

        // Call the handler
        const result = await toolHandler({
          slug: "non-existent-task",
        });

        // Verify the result
        expect(result).toEqual({
          content: [
            {
              type: "text",
              text: "Error deleting task: Task not found",
            },
          ],
          isError: true,
        });
      });
    });
  });

  describe("registerResources", () => {
    describe("tasks list resource", () => {
      it("should register the tasks list resource", () => {
        // Verify that the resource method was called with the correct name
        expect(mockResource).toHaveBeenCalledWith(
          "tasks",
          expect.any(String),
          expect.any(Function)
        );
      });

      it("should handle successful tasks list retrieval", async () => {
        // Create mock tasks
        const mockTasks = [
          {
            title: { value: "Task 1" },
            description: { value: "Description 1" },
            slug: { value: "1-task-1" },
            isDone: false,
          },
          {
            title: { value: "Task 2" },
            description: { value: "Description 2" },
            slug: { value: "2-task-2" },
            isDone: true,
          },
        ];

        // Setup mock implementation for GetAllTasksUseCase
        const mockExecute = vi.fn().mockResolvedValue(mockTasks);

        // Mock the FileSystemTaskRepository constructor
        vi.mocked(FileSystemTaskRepository).mockImplementation(
          () => ({}) as unknown as FileSystemTaskRepository
        );

        // Mock the GetAllTasksUseCase
        vi.mocked(GetAllTasksUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as GetAllTasksUseCase
        );

        // Extract the handler function from the resource registration
        const resourceCall = mockResource.mock.calls.find(
          (call) => call[0] === "tasks"
        );

        // Ensure the resource was registered
        expect(resourceCall).toBeDefined();
        const resourceHandler = resourceCall![2];

        // Create a mock URI
        const mockUri = new URL("tasks://list");

        // Call the handler
        const result = await resourceHandler(mockUri);

        // Verify the result
        expect(result).toEqual({
          contents: [
            {
              uri: "tasks://list",
              text: "- [ ] Task 1 (1-task-1)\n- [x] Task 2 (2-task-2)",
            },
          ],
        });

        // Verify the use case was called
        expect(mockExecute).toHaveBeenCalled();
      });

      it("should handle empty task list", async () => {
        // Setup mock implementation for GetAllTasksUseCase to return empty array
        const mockExecute = vi.fn().mockResolvedValue([]);

        // Mock the GetAllTasksUseCase
        vi.mocked(GetAllTasksUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as GetAllTasksUseCase
        );

        // Extract the handler function from the resource registration
        const resourceCall = mockResource.mock.calls.find(
          (call) => call[0] === "tasks"
        );

        // Ensure the resource was registered
        expect(resourceCall).toBeDefined();
        const resourceHandler = resourceCall![2];

        // Create a mock URI
        const mockUri = new URL("tasks://list");

        // Call the handler
        const result = await resourceHandler(mockUri);

        // Verify the result
        expect(result).toEqual({
          contents: [
            {
              uri: "tasks://list",
              text: "No tasks found.",
            },
          ],
        });
      });

      it("should handle errors during task list retrieval", async () => {
        // Setup mock implementation for GetAllTasksUseCase to throw an error
        const mockExecute = vi
          .fn()
          .mockRejectedValue(new Error("Failed to retrieve tasks"));

        // Mock the GetAllTasksUseCase
        vi.mocked(GetAllTasksUseCase).mockImplementation(
          () =>
            ({
              execute: mockExecute,
            }) as unknown as GetAllTasksUseCase
        );

        // Extract the handler function from the resource registration
        const resourceCall = mockResource.mock.calls.find(
          (call) => call[0] === "tasks"
        );

        // Ensure the resource was registered
        expect(resourceCall).toBeDefined();
        const resourceHandler = resourceCall![2];

        // Create a mock URI
        const mockUri = new URL("tasks://list");

        // Call the handler
        const result = await resourceHandler(mockUri);

        // Verify the result
        expect(result).toEqual({
          contents: [
            {
              uri: "tasks://list",
              text: "Error listing tasks: Failed to retrieve tasks",
            },
          ],
        });
      });
    });
  });
});
