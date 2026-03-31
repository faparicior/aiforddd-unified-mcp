# Global Behaviour: CLI Tool Bridge

**Feature ID**: GB-CLI-001  
**Category**: CLI  
**Priority**: High  
**Status**: ✅ Implemented

## Description

The `ddd-tool` CLI binary is a universal bridge that exposes every registered MCP tool as a standalone CLI command. It uses the exact same tool handlers and Zod validation as the MCP server — there is no unique logic. Any tool available via MCP is also available via `ddd-tool <name>`.

**Applies To:**

- All MCP tools (36 tools)
- CLI users who need tool access without an MCP client session

---

## Scenarios

### Scenario 1: Execute a tool by name with JSON args

```gherkin
Given the ddd-tool binary is executed
When the user runs: ddd-tool parse_markdown_table --args '{"filePath": "/path/to/file.md"}'
Then the tool registry resolves "parse_markdown_table" handler
And the JSON args are parsed and validated against the tool's Zod schema
And the handler is invoked with the validated args
And the result is printed to stdout as JSON
```

---

### Scenario 2: Execute a tool with individual field options

```gherkin
Given the tool "read_file" has a Zod schema with field "path"
When the user runs: ddd-tool read_file --path /path/to/file.ts
Then the --path option is extracted from the command
And the value is passed to the handler as { path: "/path/to/file.ts" }
And the result is printed to stdout
```

---

### Scenario 3: Auto type coercion for Zod schemas

```gherkin
Given the tool "get_row" has a Zod schema with "rowIndex" as z.number()
When the user runs: ddd-tool get_row --filePath /file.md --rowIndex 5
Then the string "5" is automatically coerced to number 5
And the handler receives { filePath: "/file.md", rowIndex: 5 }
```

---

### Scenario 4: Invalid JSON in --args

```gherkin
Given the ddd-tool binary is executed
When the user runs: ddd-tool echo --args 'not valid json'
Then the error "Invalid JSON provided for --args: not valid json" is printed to stderr
And the process exits with code 1
```

---

### Scenario 5: Merge --args and individual options

```gherkin
Given a tool has fields "filePath" and "rowIndex"
When the user runs: ddd-tool get_row --args '{"filePath": "/file.md"}' --rowIndex 3
Then the args from --args JSON and --rowIndex are merged
And the handler receives { filePath: "/file.md", rowIndex: 3 }
```

---

### Scenario 6: List all available tools

```gherkin
Given the ddd-tool binary is executed
When the user runs: ddd-tool --help
Then all 36 registered tool names are listed as subcommands
And each shows its description
```

---

## Implementation Details

### Affected Components

- `src/cli-tools.ts` — Dynamic CLI command generation via Commander.js
- `src/shared/cli/registry.ts` — `globalToolRegistry.getTools()` provides available tools

### Logic Implementation

The CLI dynamically generates a Commander.js subcommand for each registered tool:

```typescript
const tools = globalToolRegistry.getTools();

for (const tool of tools) {
	const cmd = program.command(tool.name).description(tool.description);

	// Add --args option for JSON input
	cmd.option('-a, --args <json>', 'JSON string containing the tool arguments');

	// Extract Zod schema shape for individual field options
	if (tool.inputSchema?.shape) {
		for (const key of Object.keys(tool.inputSchema.shape)) {
			cmd.option(`--${key} <value>`, `${key} argument`);
		}
	}

	cmd.action(async (options) => {
		// Merge --args JSON + individual options → validate → invoke handler
	});
}
```

### Related Specs & Behaviours

- [GB-SRV-002: Tool Registry Pattern](../server/gb-srv-002-tool-registry.md) — source of tool definitions
- All FEAT-001 through FEAT-009 — each tool is accessible via this bridge
