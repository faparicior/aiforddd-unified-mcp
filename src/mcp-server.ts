#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registers
import { registerTools as registerMarkdownTools } from "./tools/markdown/tools/index.js";
import { registerTools as registerReadFileTools } from "./tools/read-files/tools/index.js";
import { registerTools as registerDependencyMapperTools } from "./tools/dependency-mapper/tools/index.js";
import { registerTools as registerBoundedContextTools } from "./tools/bounded-context-canvas/tools/index.js";
import { registerTools as registerCodeManifestTools } from "./tools/code-manifest/register.js";

// Create an MCP server
const server = new McpServer(
  {
    name: "ddd-for-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
console.error("Registering Markdown tools...");
registerMarkdownTools(server);

console.error("Registering Read File tools...");
registerReadFileTools(server);

console.error("Registering Dependency Mapper tools...");
registerDependencyMapperTools(server);

console.error("Registering Bounded Context Canvas tools...");
registerBoundedContextTools(server);

console.error("Registering Code Manifest tools...");
registerCodeManifestTools(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DDD for AI unified MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
