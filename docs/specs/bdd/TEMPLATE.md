# BDD Specification Template

Feature specs use sequential IDs: `feat-[number]-[short-description].md`

---

# Feature: [Feature Name]

**Feature ID**: FEAT-XXX  
**Category**: [e.g., MCP Tools / Markdown, MCP Tools / Code Manifest, CLI Orchestrators]  
**Priority**: [High/Medium/Low]  
**Status**: [📋 Planned / 🏗️ In Progress / ✅ Implemented]

## Description

[1-2 sentences describing the feature and its value to the user.]

**Related Specs:**

- [FEAT-XXX: Related Feature](./path-to-related.md)
- [GB-SRV-001: MCP Server Initialization](../_global-behaviours/server/gb-srv-001-mcp-server-initialization.md)

---

## Background

```gherkin
Given [common precondition 1]
And [common precondition 2]
```

---

## Scenarios

### Scenario 1: [Happy Path Name]

```gherkin
Given [initial state]
When [user action / MCP tool invocation]
Then [expected outcome]
  | Column 1 | Column 2 |
  | Value 1  | Value 2  |
```

---

### Scenario 2: [Error/Alternative Path]

```gherkin
Given [initial state]
When [invalid action]
Then [system should return error]
And [provide recovery information]
```

---

## Scenario Implementation

### MCP Tool Interface

| Tool Name     | `tool_name`                                                |
| ------------- | ---------------------------------------------------------- |
| Description   | [Brief description of tool purpose]                        |
| Input Schema  | See [Data Structures](#data-structures) below              |
| Response Type | `{ content: [{ type: "text", text: string }] }`           |
| Error Type    | Thrown `Error` with descriptive message                     |

### CLI Invocation (if applicable)

```bash
# Via ddd-tool (universal CLI bridge — see GB-CLI-001)
ddd-tool <tool_name> --args '{"param": "value"}'

# Via dedicated CLI binary (if one exists for this feature)
ddd-<binary> --flag <value>
```

### Files

- `src/tools/[module]/tools/index.ts` – Tool registration and handler
- `src/tools/[module]/utils/[name].ts` – Core logic
- `src/tools/[module]/types.ts` – Type definitions (if applicable)

### Data Structures

```typescript
// Input schema (Zod)
z.object({
	param: z.string().describe("Description of param"),
});

// Response format
{
  content: [{ type: "text", text: "result" }]
}
```

### Validation Rules

1. **[Rule Name]**: [Description]
2. **[Rule Name]**: [Description]

---

## Implementation Notes

### [Core Logic] Pseudocode

```typescript
async function myToolHandler(args: MyArgs) {
	// Step-by-step logic implementation
}
```

### Security Considerations

1. **Path Traversal**: Ensure file operations use resolved absolute paths.
2. **Input Validation**: All inputs validated by Zod schema before handler execution.

---

## Testing Strategy

### Unit Tests (`tests/[module]/unit/tools/[name].test.ts`)

- [ ] Test individual tool handler in isolation
- [ ] Mock file system operations where applicable

### Integration Tests (`tests/[module]/integration/mcp-server.test.ts`)

- [ ] Test tool invocation via MCP server protocol
- [ ] Verify response format matches MCP contract

---

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] Errors are returned with descriptive messages
- [ ] Input validation rejects malformed parameters
- [ ] All unit and integration tests pass
