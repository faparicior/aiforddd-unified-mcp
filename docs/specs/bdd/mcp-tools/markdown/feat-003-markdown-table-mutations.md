# Feature: Markdown Table Mutations

**Feature ID**: FEAT-003  
**Category**: MCP Tools / Markdown  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for modifying markdown tables in-place: updating rows, clearing columns, and adding/removing columns. These write operations are used by DDD classification workflows to track cataloging progress and manage manifest table structure.

**Related Specs:**

- [FEAT-001: Markdown Table Parsing](./feat-001-markdown-table-parsing.md)
- [FEAT-002: Markdown Table Row Queries](./feat-002-markdown-table-row-queries.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Markdown tools module is registered
And a markdown file exists containing a table with header row, separator row, and data rows
And the file is writable
```

---

## Tools Covered

| Tool Name              | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| `update_row_by_match`  | Update a row by matching current values (before) and replacing (after)    |
| `update_row_by_column` | Update a row using a unique column identifier                             |
| `empty_column`         | Clear all values in a specific column to empty strings                    |
| `add_column`           | Add a new column at a specified position                                  |
| `delete_column`        | Remove a column by name                                                   |

---

## Scenarios

### Scenario 1: Update a row by matching current values

```gherkin
Given a markdown table with a row: | UserService | Application |  |
When the "update_row_by_match" tool is invoked with:
  {
    "filePath": "/path/to/file.md",
    "before": { "Class": "UserService", "Layer": "Application" },
    "after": { "Class": "UserService", "Layer": "Application", "Catalogued": "✓" }
  }
Then the row is updated in the file
And the file is written back to disk
And the response confirms the update
```

---

### Scenario 2: Update row by match — no matching row

```gherkin
Given no row in the table matches the "before" criteria
When the "update_row_by_match" tool is invoked
Then an error is returned indicating no matching row was found
And the file is not modified
```

---

### Scenario 3: Update a row by column identifier

```gherkin
Given a markdown table where "Class" column has unique values
When the "update_row_by_column" tool is invoked with:
  {
    "filePath": "/path/to/file.md",
    "columnName": "Class",
    "columnValue": "UserService",
    "updates": { "Layer": "Domain", "Catalogued": "✓" }
  }
Then the row where Class="UserService" is updated with the new Layer and Catalogued values
And the file is written back to disk
```

---

### Scenario 4: Update row by column — identifier not found

```gherkin
Given no row has "Class" = "NonExistent"
When the "update_row_by_column" tool is invoked with { "columnValue": "NonExistent" }
Then an error is returned indicating the row was not found
And the file is not modified
```

---

### Scenario 5: Empty all values in a column

```gherkin
Given a markdown table with a "Catalogued" column containing "✓" in some rows
When the "empty_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Catalogued" }
Then all values in the "Catalogued" column are set to empty strings
And the file is written back to disk
And the header row and column structure remain intact
```

---

### Scenario 6: Add a new column

```gherkin
Given a markdown table with columns: Class, Layer, Catalogued
When the "add_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Notes", "position": 3 }
Then a "Notes" column is added at position 3 (0-based)
And all existing rows have empty values for the new column
And the file is written back to disk
```

---

### Scenario 7: Delete a column

```gherkin
Given a markdown table with columns: Class, Layer, Catalogued, Notes
When the "delete_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Notes" }
Then the "Notes" column is removed from the header, separator, and all data rows
And the file is written back to disk
```

---

### Scenario 8: Delete non-existent column

```gherkin
Given a markdown table without a column named "NonExistent"
When the "delete_column" tool is invoked with { "columnName": "NonExistent" }
Then an error is returned indicating the column was not found
And the file is not modified
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `update_row_by_match`, `update_row_by_column`, `empty_column`, `add_column`, `delete_column` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// update_row_by_match
z.object({
	filePath: z.string(),
	before: z.record(z.string(), z.any()),
	after: z.record(z.string(), z.any()),
	tableIndex: z.number().optional().default(0),
});

// update_row_by_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	columnValue: z.string(),
	updates: z.record(z.string(), z.any()),
	tableIndex: z.number().optional().default(0),
});

// empty_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	tableIndex: z.number().optional().default(0),
});

// add_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	position: z.number(),
	tableIndex: z.number().optional().default(0),
});

// delete_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	tableIndex: z.number().optional().default(0),
});
```

### Files

- `src/tools/markdown/tools/index.ts` — Tool registration
- `src/tools/markdown/tools/updateRowByMatch.ts` — Match-and-replace handler
- `src/tools/markdown/tools/updateRowByColumn.ts` — Column-identifier update handler
- `src/tools/markdown/tools/emptyColumn.ts` — Column clearing handler
- `src/tools/markdown/tools/addColumn.ts` — Column addition handler
- `src/tools/markdown/tools/deleteColumn.ts` — Column deletion handler
- `src/tools/markdown/utils/parser.ts` — Core parsing and writing logic

---

## Testing Strategy

### Unit Tests

- `tests/markdown/unit/tools/updateRowByMatch.test.ts`
- `tests/markdown/unit/tools/updateRowByColumn.test.ts`
- `tests/markdown/unit/tools/emptyColumn.test.ts`
- `tests/markdown/unit/tools/addColumn.test.ts`
- `tests/markdown/unit/tools/deleteColumn.test.ts`

---

## Acceptance Criteria

- [ ] `update_row_by_match` finds and replaces the correct row without affecting other rows
- [ ] `update_row_by_column` updates the row identified by the unique column value
- [ ] `empty_column` clears all data values while preserving table structure
- [ ] `add_column` inserts a new column at the specified position with empty values
- [ ] `delete_column` removes the column from header, separator, and all data rows
- [ ] All mutation tools write changes back to the file atomically
- [ ] Missing rows/columns produce descriptive error messages
- [ ] File is not modified when an error occurs
