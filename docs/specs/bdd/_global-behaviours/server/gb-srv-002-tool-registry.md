# Global Behaviour: Tool Registry Pattern

**Feature ID**: GB-SRV-002  
**Category**: Server  
**Priority**: Critical  
**Status**: ✅ Implemented

## Description

The `ToolRegistry` class is the centralized mechanism for registering, storing, and exposing all MCP tools. Every tool in the system is registered here before being bound to the MCP server or CLI.

**Applies To:**

- All MCP tool registrations
- All CLI tool invocations via `ddd-tool` (GB-CLI-001)
- MCP server binding (GB-SRV-001)

---

## Scenarios

### Scenario 1: Register a tool

```gherkin
Given the global ToolRegistry instance exists
When a tool module calls globalToolRegistry.registerTool() with name, description, inputSchema, and handler
Then the tool is stored in the registry Map keyed by name
And the tool is available via getTools() and getTool(name)
```

---

### Scenario 2: Retrieve all registered tools

```gherkin
Given multiple tools have been registered
When getTools() is called
Then an array of all registered ToolDefinition objects is returned
And the array preserves insertion order
```

---

### Scenario 3: Retrieve a single tool by name

```gherkin
Given a tool named "parse_markdown_table" is registered
When getTool("parse_markdown_table") is called
Then the matching ToolDefinition is returned with its name, description, inputSchema, and handler
```

---

### Scenario 4: Unknown tool name returns undefined

```gherkin
Given the registry is loaded
When getTool("nonexistent_tool") is called
Then undefined is returned
And no error is thrown
```

---

### Scenario 5: Duplicate tool name overwrites with warning

```gherkin
Given a tool named "echo" is already registered
When another tool with name "echo" is registered
Then a warning is logged: "Tool echo is already registered. Overwriting."
And the new tool replaces the previous registration
```

---

### Scenario 6: Bind registry to MCP server

```gherkin
Given tools have been registered in the global registry
When registerToMcpServer(server) is called with an McpServer instance
Then each tool is registered on the MCP server with its name, description, inputSchema, and handler
And all tools become available via the MCP protocol
```

---

## Data Contract

```typescript
export interface ToolDefinition<T extends ZodTypeAny> {
	name: string;
	description: string;
	inputSchema: T; // Zod schema for input validation
	handler: (args: z.infer<T>, extra?: any) => Promise<any>;
}
```

---

## Implementation Details

### Affected Components

- `src/shared/cli/registry.ts` — `ToolRegistry` class and `globalToolRegistry` singleton

### Public API

```typescript
class ToolRegistry {
	registerTool<T extends ZodTypeAny>(tool: ToolDefinition<T>): void;
	getTools(): ToolDefinition<any>[];
	getTool(name: string): ToolDefinition<any> | undefined;
	registerToMcpServer(server: McpServer): void;
}

export const globalToolRegistry: ToolRegistry;
```

### Related Specs & Behaviours

- [GB-SRV-001: MCP Server Initialization](./gb-srv-001-mcp-server-initialization.md) — uses `registerToMcpServer()`
- [GB-CLI-001: CLI Tool Bridge](../cli/gb-cli-001-cli-tool-bridge.md) — uses `getTools()` to generate CLI commands
- All FEAT-001 through FEAT-009 — each registers tools via this pattern
