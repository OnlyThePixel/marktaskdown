import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { InitializeProjectUseCase } from "../../application/useCases/commands/InitializeProjectUseCase.js";

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
  }

  /**
   * Registers all resources with the MCP server
   *
   * Resources will be implemented in subsequent tasks
   */
  private registerResources(): void {
    // Resource registrations will be implemented in subsequent tasks
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
