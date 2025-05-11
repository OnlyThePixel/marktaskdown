#!/usr/bin/env node

import { MarkTaskDownMcpServer } from "./server.js";

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  let server: MarkTaskDownMcpServer | null = null;

  try {
    // Create and start the server
    server = new MarkTaskDownMcpServer();
    await server.start();
    console.log("MarkTaskDown MCP Server started with STDIO transport");
  } catch (error) {
    // Handle initialization errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error starting MarkTaskDown MCP Server: ${errorMessage}`);
    process.exit(1);
  }

  // Handle process signals for graceful shutdown
  const handleShutdown = () => {
    console.log("Shutting down MarkTaskDown MCP Server...");
    if (server) {
      server.close();
    }
    process.exit(0);
  };

  // Register signal handlers
  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

// Start the server
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
