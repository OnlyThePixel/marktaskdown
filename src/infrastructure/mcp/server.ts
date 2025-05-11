import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GetAllTasksUseCase } from "../../application/useCases/queries/GetAllTasksUseCase.js";
import { GetTaskBySlugUseCase } from "../../application/useCases/queries/GetTaskBySlugUseCase.js";
import { InitializeProjectUseCase } from "../../application/useCases/commands/InitializeProjectUseCase.js";
import { CreateTaskUseCase } from "../../application/useCases/commands/CreateTaskUseCase.js";
import { SetTaskAsDoneUseCase } from "../../application/useCases/commands/SetTaskAsDoneUseCase.js";
import { SetTaskAsUndoneUseCase } from "../../application/useCases/commands/SetTaskAsUndoneUseCase.js";
import { DeleteTaskUseCase } from "../../application/useCases/commands/DeleteTaskUseCase.js";
import { FileSystemTaskRepository } from "../../infrastructure/repositories/FileSystemTaskRepository.js";
import { Slug } from "../../domain/valueObjects/Slug.js";

/**
 * MarkTaskDown MCP Server
 *
 * This class implements a Model Context Protocol server for MarkTaskDown,
 * allowing LLM applications to interact with the task management system.
 */
export class MarkTaskDownMcpServer {
  private mcpServer: McpServer;
  private transport: StdioServerTransport;

  /**
   * Creates a new instance of the MarkTaskDown MCP server
   */
  constructor() {
    this.mcpServer = new McpServer({
      name: "MarkTaskDown",
      version: "1.0.0",
    });

    this.transport = new StdioServerTransport();
    this.registerTools();
    this.registerResources();
  }

  /**
   * Registers all tools with the MCP server
   *
   * Tools will be implemented in subsequent tasks
   */
  private registerTools(): void {
    // Register the initialize-project tool
    this.mcpServer.tool(
      "initialize-project",
      {}, // No parameters required
      async () => {
        try {
          // Create and execute the use case
          const useCase = new InitializeProjectUseCase();
          const result = await useCase.execute();

          // Format the response
          const message = result.created
            ? `Project initialized at ${result.tasksDir}`
            : `Project already initialized at ${result.tasksDir}`;

          return {
            content: [{ type: "text", text: message }],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error initializing project";

          return {
            content: [
              {
                type: "text",
                text: `Error initializing project: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Register the create-task tool
    this.mcpServer.tool(
      "create-task",
      {
        // Define parameters schema using zod
        title: z.string().min(1, "Title is required"),
        description: z.string().optional().default(""),
      },
      async (params) => {
        try {
          // Create repository and use case
          const taskRepository = new FileSystemTaskRepository();
          const useCase = new CreateTaskUseCase(taskRepository);

          // Execute the use case with the provided parameters
          const task = await useCase.execute({
            title: params.title,
            description: params.description || "",
          });

          // Format the response
          return {
            content: [
              {
                type: "text",
                text: `Task created: ${task.title.value} (${task.slug.value})`,
              },
            ],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error creating task";

          return {
            content: [
              {
                type: "text",
                text: `Error creating task: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Register the set-task-done tool
    this.mcpServer.tool(
      "set-task-done",
      {
        // Define parameters schema using zod
        slug: z.string().min(1, "Slug is required"),
      },
      async (params) => {
        try {
          // Create repository and use case
          const taskRepository = new FileSystemTaskRepository();
          const useCase = new SetTaskAsDoneUseCase(taskRepository);

          // Create a Slug value object from the string parameter
          const slug = new Slug(params.slug);

          // Execute the use case with the provided slug
          const task = await useCase.execute(slug);

          // Format the response
          return {
            content: [
              {
                type: "text",
                text: `Task marked as done: ${task.title.value} (${task.slug.value})`,
              },
            ],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error marking task as done";

          return {
            content: [
              {
                type: "text",
                text: `Error marking task as done: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Register the set-task-undone tool
    this.mcpServer.tool(
      "set-task-undone",
      {
        // Define parameters schema using zod
        slug: z.string().min(1, "Slug is required"),
      },
      async (params) => {
        try {
          // Create repository and use case
          const taskRepository = new FileSystemTaskRepository();
          const useCase = new SetTaskAsUndoneUseCase(taskRepository);

          // Create a Slug value object from the string parameter
          const slug = new Slug(params.slug);

          // Execute the use case with the provided slug
          const task = await useCase.execute(slug);

          // Format the response
          return {
            content: [
              {
                type: "text",
                text: `Task marked as undone: ${task.title.value} (${task.slug.value})`,
              },
            ],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error marking task as undone";

          return {
            content: [
              {
                type: "text",
                text: `Error marking task as undone: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Register the delete-task tool
    this.mcpServer.tool(
      "delete-task",
      {
        // Define parameters schema using zod
        slug: z.string().min(1, "Slug is required"),
      },
      async (params) => {
        try {
          // Create repository and use case
          const taskRepository = new FileSystemTaskRepository();
          const useCase = new DeleteTaskUseCase(taskRepository);

          // Create a Slug value object from the string parameter
          const slug = new Slug(params.slug);

          // Execute the use case with the provided slug
          const task = await useCase.execute(slug);

          // Format the response
          return {
            content: [
              {
                type: "text",
                text: `Task deleted: ${task.title.value} (${task.slug.value})`,
              },
            ],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error deleting task";

          return {
            content: [
              {
                type: "text",
                text: `Error deleting task: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Registers all resources with the MCP server
   *
   * Resources will be implemented in subsequent tasks
   */
  private registerResources(): void {
    // Register the tasks list resource
    this.mcpServer.resource("tasks", "tasks://list", async (uri) => {
      try {
        // Create repository and use case
        const taskRepository = new FileSystemTaskRepository();
        const useCase = new GetAllTasksUseCase(taskRepository);

        // Execute the use case to get all tasks
        const tasks = await useCase.execute();

        // Format the tasks as a markdown list
        let formattedTasks: string;

        if (tasks.length === 0) {
          formattedTasks = "No tasks found.";
        } else {
          formattedTasks = tasks
            .map((task) => {
              const statusMark = task.isDone ? "x" : " ";
              return `- [${statusMark}] ${task.title.value} (${task.slug.value})`;
            })
            .join("\n");
        }

        // Return the formatted task list
        return {
          contents: [
            {
              uri: uri.href,
              text: formattedTasks,
            },
          ],
        };
      } catch (error) {
        // Handle errors
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error listing tasks";

        // Return error response
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error listing tasks: ${errorMessage}`,
            },
          ],
        };
      }
    });

    // Register the task detail resource with parameterized URI
    this.mcpServer.resource(
      "task",
      new ResourceTemplate("tasks://{slug}", { list: undefined }),
      async (uri, params) => {
        try {
          // Extract the slug parameter from the URI
          const slugParam = params.slug as string;

          if (!slugParam) {
            throw new Error("Slug parameter is required");
          }

          // Create a Slug value object from the string parameter
          const slug = new Slug(slugParam);

          // Create repository and use case
          const taskRepository = new FileSystemTaskRepository();
          const useCase = new GetTaskBySlugUseCase(taskRepository);

          // Execute the use case with the slug
          const task = await useCase.execute(slug);

          if (!task) {
            throw new Error(`Task with slug '${slugParam}' not found`);
          }

          // Format the task details as markdown
          const statusText = task.isDone ? "Done" : "Not Done";
          const formattedTask = `# ${task.title.value}\n\nStatus: ${statusText}\nSlug: ${task.slug.value}\n\n${task.description.value}`;

          // Return the formatted task details
          return {
            contents: [
              {
                uri: uri.href,
                text: formattedTask,
              },
            ],
          };
        } catch (error) {
          // Handle errors
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unknown error retrieving task";

          // Return error response
          return {
            contents: [
              {
                uri: uri.href,
                text: `Error retrieving task: ${errorMessage}`,
              },
            ],
          };
        }
      }
    );
  }

  /**
   * Starts the MCP server with STDIO transport
   *
   * @returns A promise that resolves when the server has started
   */
  public async start(): Promise<void> {
    try {
      await this.mcpServer.connect(this.transport);
      console.log("MarkTaskDown MCP Server started with STDIO transport");
    } catch (error) {
      console.error("Failed to start MarkTaskDown MCP Server", error);
      throw error;
    }
  }

  /**
   * Closes the MCP server and its transport
   */
  public close(): void {
    try {
      this.transport.close();
      this.mcpServer.close();
      console.log("MarkTaskDown MCP Server closed");
    } catch (error) {
      console.error("Failed to close MarkTaskDown MCP Server", error);
    }
  }
}
