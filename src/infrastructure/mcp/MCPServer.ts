import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { Server } from "node:http";

/**
 * MCPServer class that implements the Model Context Protocol server for MarkTaskDown.
 * This server enables AI agents to interact with MarkTaskDown as a task management system.
 */
export class MCPServer {
  private app: express.Application;
  private httpServer?: Server;
  private mcpServer: McpServer;
  private transports: { [sessionId: string]: StreamableHTTPServerTransport } =
    {};
  public port: number;

  /**
   * Creates a new MCPServer instance.
   */
  constructor() {
    // Set the port from environment variable or use default
    this.port = parseInt(process.env.MTD_MCP_PORT || "4242", 10);

    // Create Express app
    this.app = express();
    this.app.use(express.json());

    // Create MCP server
    this.mcpServer = new McpServer({
      name: "MarkTaskDown",
      version: "1.0.0",
    });

    // Configure routes
    this.configureRoutes();
  }

  /**
   * Configures the Express routes for the MCP server.
   */
  private configureRoutes(): void {
    // Health check endpoint
    this.app.get("/health", async (req: Request, res: Response) => {
      const response = await this.getHealthStatus();
      res.status(200).json(response);
    });

    // Root endpoint (also serves as health check)
    this.app.get("/", async (req: Request, res: Response) => {
      const response = await this.getHealthStatus();
      res.status(200).json(response);
    });

    // MCP endpoint for client-to-server communication
    this.app.post("/mcp", async (req: Request, res: Response) => {
      try {
        // Check for existing session ID
        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && this.transports[sessionId]) {
          // Reuse existing transport
          transport = this.transports[sessionId];
        } else {
          // New session
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID
              this.transports[sessionId] = transport;
              console.log(`[MCP] New session initialized: ${sessionId}`);
            },
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete this.transports[transport.sessionId];
              console.log(`[MCP] Session closed: ${transport.sessionId}`);
            }
          };

          // Connect to the MCP server
          await this.mcpServer.connect(transport);
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("[MCP] Error handling request:", error);
        const errorResponse = this.handleError(error as Error);
        if (!res.headersSent) {
          res.status(500).json(errorResponse);
        }
      }
    });

    // Handle GET requests for server-to-client notifications via SSE
    this.app.get("/mcp", this.handleSessionRequest.bind(this));

    // Handle DELETE requests for session termination
    this.app.delete("/mcp", this.handleSessionRequest.bind(this));

    // Handle 404 for unrecognized routes
    this.app.use((req: Request, res: Response) => {
      const response = this.handle404();
      res.status(404).json(response);
    });
  }

  /**
   * Handles session-related requests (GET and DELETE).
   */
  private async handleSessionRequest(
    req: Request,
    res: Response
  ): Promise<void> {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (!sessionId || !this.transports[sessionId]) {
      res.status(400).json({
        status: "error",
        message: "Invalid or missing session ID",
      });
      return;
    }

    const transport = this.transports[sessionId];
    try {
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error(
        `[MCP] Error handling session request for ${sessionId}:`,
        error
      );
      const errorResponse = this.handleError(error as Error);
      if (!res.headersSent) {
        res.status(500).json(errorResponse);
      }
    }
  }

  /**
   * Returns the health status of the server.
   */
  public getHealthStatus(): { status: string; data: { message: string } } {
    return {
      status: "success",
      data: {
        message: "MarkTaskDown MCP Server is running",
      },
    };
  }

  /**
   * Handles 404 Not Found errors.
   */
  public handle404(): { status: string; message: string } {
    return {
      status: "error",
      message: "Not Found",
    };
  }

  /**
   * Handles server errors.
   */
  public handleError(error: Error): { status: string; message: string } {
    console.error("[MCP] Server error:", error);
    return {
      status: "error",
      message: "Internal Server Error",
    };
  }

  /**
   * Starts the MCP server.
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = this.app.listen(this.port, () => {
        console.log(`[MCP] Server started on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stops the MCP server.
   */
  public async stop(): Promise<void> {
    if (this.httpServer) {
      // Close all transports
      for (const sessionId in this.transports) {
        this.transports[sessionId].close();
      }

      // Close the MCP server
      this.mcpServer.close();

      // Close the HTTP server
      return new Promise((resolve, reject) => {
        this.httpServer?.close((err?: Error) => {
          if (err) {
            console.error("[MCP] Error closing server:", err);
            reject(err);
          } else {
            console.log("[MCP] Server stopped");
            resolve();
          }
        });
      });
    }
    return Promise.resolve();
  }
}
