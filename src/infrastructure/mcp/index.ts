import { MCPServer } from "./MCPServer.js";

/**
 * Entry point for the MarkTaskDown MCP server.
 * This script starts the MCP server and handles graceful shutdown.
 */
async function main() {
  const server = new MCPServer();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n[MCP] Received SIGINT signal. Shutting down gracefully...");
    await server.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("[MCP] Received SIGTERM signal. Shutting down gracefully...");
    await server.stop();
    process.exit(0);
  });

  // Start the server
  try {
    await server.start();
    console.log(
      `[MCP] MarkTaskDown MCP Server is running on port ${server.port}`
    );
    console.log("[MCP] Press Ctrl+C to stop the server");
  } catch (error) {
    console.error("[MCP] Failed to start server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[MCP] Unhandled error:", error);
  process.exit(1);
});
