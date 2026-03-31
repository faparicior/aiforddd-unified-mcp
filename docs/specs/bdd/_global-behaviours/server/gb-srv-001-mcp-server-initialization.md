# Global Behaviour: MCP Server Initialization

**Feature ID**: GB-SRV-001  
**Category**: Server  
**Priority**: Critical  
**Status**: ✅ Implemented

## Description

The MCP server initializes on stdio transport, registering all tool modules in a defined order before accepting client connections. This behaviour covers the `ddd-mcp` CLI binary.

**Applies To:**

- Server startup (`ddd-mcp` binary)
- All MCP tool invocations (tools must be registered before use)

---

## Scenarios

### Scenario 1: Successful server startup

```gherkin
Given the ddd-mcp binary is executed
When the MCP server initializes
Then the server is created with name "ddd-for-ai-mcp" and version "1.0.0"
And tools are registered in order: Markdown → Read Files → Dependency Mapper → Bounded Context Canvas → Code Manifest
And all 36 tools are available via the MCP protocol
And the server connects to stdio transport
And the message "DDD for AI unified MCP server running on stdio" is logged to stderr
```

---

### Scenario 2: Tool registration order is preserved

```gherkin
Given the MCP server is initializing
When each tool module calls registerTools()
Then Markdown tools (16) are registered first
And Read File tools (4) are registered second
And Dependency Mapper tools (2) are registered third
And Bounded Context Canvas tools (5) are registered fourth
And Code Manifest tools (9) are registered fifth
And all tools are bound to the MCP server via globalToolRegistry.registerToMcpServer()
```

---

### Scenario 3: Server startup failure is handled gracefully

```gherkin
Given the ddd-mcp binary is executed
When an error occurs during server initialization
Then the error is logged to stderr: "Server error: <message>"
And the process exits with code 1
```

---

## Implementation Details

### Affected Components

- `src/mcp-server.ts` — Server entry point and tool registration orchestration
- `src/shared/cli/registry.ts` — Global tool registry (GB-SRV-002)

### Logic Implementation

The server follows a synchronous registration → async connection pattern:

```typescript
// 1. Create MCP server
const server = new McpServer({ name: "ddd-for-ai-mcp", version: "1.0.0" });

// 2. Register tools to global registry (synchronous, ordered)
registerMarkdownTools();
registerReadFileTools();
registerDependencyMapperTools();
registerBoundedContextTools();
registerCodeManifestTools();

// 3. Bind registry to MCP server
globalToolRegistry.registerToMcpServer(server);

// 4. Connect to stdio transport (async)
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Related Specs & Behaviours

- [GB-SRV-002: Tool Registry Pattern](./gb-srv-002-tool-registry.md)
- [GB-CLI-001: CLI Tool Bridge](../cli/gb-cli-001-cli-tool-bridge.md) — also uses `globalToolRegistry`
