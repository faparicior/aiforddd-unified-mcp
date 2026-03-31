# Feature: Bounded Context Canvas

**Feature ID**: FEAT-006  
**Category**: MCP Tools / Bounded Context Canvas  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for parsing and updating DDD Bounded Context Canvas documents in markdown format. Supports reading the canvas structure and modifying individual fields (context name, purpose, strategic classification, domain roles).

**Related Specs:**

- [FEAT-007: Manifest Generation](../code-manifest/feat-007-manifest-generation.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Bounded Context Canvas tools module is registered
And a bounded context canvas markdown file exists following the standard template
```

---

## Tools Covered

| Tool Name                        | Description                                                     |
| -------------------------------- | --------------------------------------------------------------- |
| `parse_bounded_context_canvas`   | Parse a bounded context canvas markdown file into structured data |
| `update_context_name`            | Update the context name in a canvas file                        |
| `update_context_purpose`         | Update the context purpose in a canvas file                     |
| `update_strategic_classification`| Update domain type, business model, and evolution stage         |
| `update_domain_roles`            | Set the domain roles in a canvas file                           |

---

## Scenarios

### Scenario 1: Parse a bounded context canvas

```gherkin
Given a bounded context canvas file at "/path/to/canvas.md" with standard markdown structure
When the "parse_bounded_context_canvas" tool is invoked with { "filePath": "/path/to/canvas.md" }
Then the response contains a structured JSON object with:
  - contextName
  - purpose
  - strategicClassification (domainType, businessModel, evolutionStage)
  - domainRoles
  - And other canvas sections
```

---

### Scenario 2: Update context name

```gherkin
Given a bounded context canvas file exists
When the "update_context_name" tool is invoked with { "filePath": "/path/to/canvas.md", "newName": "Order Processing" }
Then the context name in the file is updated to "Order Processing"
And the file is written back to disk
And the response confirms the update
```

---

### Scenario 3: Update context purpose

```gherkin
Given a bounded context canvas file exists
When the "update_context_purpose" tool is invoked with:
  { "filePath": "/path/to/canvas.md", "newPurpose": "Manages order lifecycle from creation to fulfillment" }
Then the purpose section in the file is updated
And the file is written back to disk
```

---

### Scenario 4: Update strategic classification

```gherkin
Given a bounded context canvas file exists
When the "update_strategic_classification" tool is invoked with:
  {
    "filePath": "/path/to/canvas.md",
    "domainType": "Core",
    "businessModel": "Revenue Generator",
    "evolutionStage": "Custom Built"
  }
Then all three strategic classification fields are updated in the file
And the file is written back to disk
```

---

### Scenario 5: Update domain roles

```gherkin
Given a bounded context canvas file exists
When the "update_domain_roles" tool is invoked with:
  { "filePath": "/path/to/canvas.md", "roles": ["Execution Context", "Gateway Context"] }
Then the domain roles section is updated with the provided roles
And the file is written back to disk
```

---

### Scenario 6: Parse invalid canvas format

```gherkin
Given a markdown file that does not follow the bounded context canvas template
When the "parse_bounded_context_canvas" tool is invoked
Then the parser extracts whatever sections it can find
And missing sections result in empty/default values
```

---

### Scenario 7: Canvas file not found

```gherkin
Given no file exists at "/path/to/missing.md"
When any bounded context canvas tool is invoked with that path
Then an error is thrown with a descriptive message
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `parse_bounded_context_canvas`, `update_context_name`, `update_context_purpose`, `update_strategic_classification`, `update_domain_roles` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// parse_bounded_context_canvas
z.object({ filePath: z.string() });

// update_context_name
z.object({ filePath: z.string(), newName: z.string() });

// update_context_purpose
z.object({ filePath: z.string(), newPurpose: z.string() });

// update_strategic_classification
z.object({
	filePath: z.string(),
	domainType: z.string(),
	businessModel: z.string(),
	evolutionStage: z.string(),
});

// update_domain_roles
z.object({
	filePath: z.string(),
	roles: z.array(z.string()),
});
```

### Files

- `src/tools/bounded-context-canvas/tools/index.ts` — Tool registration
- `src/tools/bounded-context-canvas/tools/parseBoundedContextCanvas.ts` — Parse handler
- `src/tools/bounded-context-canvas/tools/updateContextName.ts` — Name update handler
- `src/tools/bounded-context-canvas/tools/updateContextPurpose.ts` — Purpose update handler
- `src/tools/bounded-context-canvas/tools/updateStrategicClassification.ts` — Classification handler
- `src/tools/bounded-context-canvas/tools/updateDomainRoles.ts` — Roles update handler

---

## Testing Strategy

### Integration Tests

- `tests/bounded-context-canvas/integration/mcp-server.test.ts` — Full MCP protocol tests

---

## Acceptance Criteria

- [ ] `parse_bounded_context_canvas` produces structured JSON from a valid canvas markdown
- [ ] `update_context_name` modifies only the name field and preserves all other content
- [ ] `update_context_purpose` modifies only the purpose section
- [ ] `update_strategic_classification` updates all three classification fields atomically
- [ ] `update_domain_roles` replaces the roles list with the provided array
- [ ] All update tools write changes back to the file
- [ ] File-not-found errors produce descriptive messages
- [ ] Invalid canvas formats degrade gracefully (partial parsing)
