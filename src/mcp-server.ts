#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { globalToolRegistry } from "./shared/cli/registry.js";

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

// Register tools to the global registry
console.error("Registering Markdown tools...");
registerMarkdownTools();

console.error("Registering Read File tools...");
registerReadFileTools();

console.error("Registering Dependency Mapper tools...");
registerDependencyMapperTools();

console.error("Registering Bounded Context Canvas tools...");
registerBoundedContextTools();

console.error("Registering Code Manifest tools...");
registerCodeManifestTools();

// Register all tools from the registry to the MCP server
console.error("Registering tools to MCP server...");
globalToolRegistry.registerToMcpServer(server);

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
