import { MarkTaskDownMcpServer } from "../../../infrastructure/mcp/server.js";

/**
 * Command to start the MarkTaskDown MCP server
 *
 * This command initializes and starts the MCP server with STDIO transport,
 * allowing LLM applications to interact with the task management system.
 */
export async function mcpServerCommand(): Promise<void> {
  try {
    console.log("Starting MarkTaskDown MCP Server...");
    console.log(
      "This will allow LLM applications to interact with your tasks."
    );

    // Create and start the server
    const server = new MarkTaskDownMcpServer();
    await server.start();

    console.log("MarkTaskDown MCP Server started with STDIO transport");
    console.log("The server will continue running until you press Ctrl+C");

    // Handle process signals for graceful shutdown
    const handleShutdown = () => {
      console.log("Shutting down MarkTaskDown MCP Server...");
      server.close();
      process.exit(0);
    };

    // Register signal handlers
    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error starting MarkTaskDown MCP Server: ${errorMessage}`);
    process.exit(1);
  }
}
