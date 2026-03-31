# Feature: Markdown Table Row Queries

**Feature ID**: FEAT-002  
**Category**: MCP Tools / Markdown  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for querying individual or multiple rows from markdown tables by index, column name/value match, or multi-column AND-logic filters. These are read-only operations used by DDD classification and WoW document generation workflows.

**Related Specs:**

- [FEAT-001: Markdown Table Parsing](./feat-001-markdown-table-parsing.md)
- [FEAT-003: Markdown Table Mutations](./feat-003-markdown-table-mutations.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Markdown tools module is registered
And a markdown file exists containing a table with header row, separator row, and data rows
```

---

## Tools Covered

| Tool Name                               | Description                                                      |
| --------------------------------------- | ---------------------------------------------------------------- |
| `get_row`                               | Get a specific row by zero-based index                           |
| `find_row`                              | Find a row by column value (must be unique match)                |
| `get_first_row_by_column`               | Get the first row matching a column value                        |
| `get_multiple_rows_by_column`           | Get all rows matching a column value                             |
| `get_multiple_rows_by_multiple_columns` | Get rows matching multiple column values (AND logic)             |

---

## Scenarios

### Scenario 1: Get a row by index

```gherkin
Given a markdown table with 10 data rows
When the "get_row" tool is invoked with { "filePath": "/path/to/file.md", "rowIndex": 3 }
Then the response contains the 4th data row (0-based) as a JSON object with column names as keys
```

---

### Scenario 2: Row index out of range

```gherkin
Given a markdown table with 5 data rows
When the "get_row" tool is invoked with { "filePath": "/path/to/file.md", "rowIndex": 10 }
Then an error is returned indicating the row index is out of range
```

---

### Scenario 3: Find a row by unique column value

```gherkin
Given a markdown table where "Class" column has unique values
When the "find_row" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Class", "value": "UserService" }
Then the response contains the single matching row as a JSON object
```

---

### Scenario 4: Find row with non-unique value fails

```gherkin
Given a markdown table where "Layer" column has duplicate values
When the "find_row" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Layer", "value": "Application" }
Then an error is returned indicating the value is not unique
```

---

### Scenario 5: Get first row matching a column value

```gherkin
Given a markdown table with multiple rows where "Layer" = "Domain"
When the "get_first_row_by_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Layer", "value": "Domain" }
Then the response contains only the first matching row
```

---

### Scenario 6: Get multiple rows matching a column value

```gherkin
Given a markdown table with 3 rows where "Layer" = "Application"
When the "get_multiple_rows_by_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Layer", "value": "Application" }
Then the response contains all 3 matching rows as a JSON array
```

---

### Scenario 7: Limit results with maxRows

```gherkin
Given a markdown table with 10 rows where "Catalogued" = ""
When the "get_multiple_rows_by_column" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Catalogued", "value": "", "maxRows": 3 }
Then the response contains at most 3 rows
```

---

### Scenario 8: Multi-column AND filter

```gherkin
Given a markdown table with rows having various "Layer" and "Catalogued" values
When the "get_multiple_rows_by_multiple_columns" tool is invoked with:
  { "filePath": "/path/to/file.md", "filters": { "Layer": "Domain", "Catalogued": "" } }
Then only rows where both Layer="Domain" AND Catalogued="" are returned
```

---

### Scenario 9: Column not found

```gherkin
Given a markdown table without a column named "NonExistent"
When any row query tool is invoked with { "columnName": "NonExistent" }
Then an error is returned indicating the column was not found
```

---

### Scenario 10: No matching rows

```gherkin
Given a markdown table where no row has "Layer" = "Presentation"
When the "get_multiple_rows_by_column" tool is invoked with { "columnName": "Layer", "value": "Presentation" }
Then the response contains an empty array
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `get_row`, `find_row`, `get_first_row_by_column`, `get_multiple_rows_by_column`, `get_multiple_rows_by_multiple_columns` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// get_row
z.object({
	filePath: z.string(),
	rowIndex: z.number(),
	tableIndex: z.number().optional().default(0),
});

// find_row
z.object({
	filePath: z.string(),
	columnName: z.string(),
	value: z.string(),
	tableIndex: z.number().optional().default(0),
});

// get_first_row_by_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	value: z.string(),
	tableIndex: z.number().optional().default(0),
});

// get_multiple_rows_by_column
z.object({
	filePath: z.string(),
	columnName: z.string(),
	value: z.string(),
	maxRows: z.number().optional(),
	tableIndex: z.number().optional().default(0),
});

// get_multiple_rows_by_multiple_columns
z.object({
	filePath: z.string(),
	filters: z.record(z.string(), z.string()),
	maxRows: z.number().optional(),
	tableIndex: z.number().optional().default(0),
});
```

### Files

- `src/tools/markdown/tools/index.ts` — Tool registration
- `src/tools/markdown/tools/getRow.ts` — Get row by index
- `src/tools/markdown/tools/findRow.ts` — Find row by unique column value
- `src/tools/markdown/tools/getFirstRowByColumn.ts` — Get first matching row
- `src/tools/markdown/tools/getMultipleRowsByColumn.ts` — Get all matching rows
- `src/tools/markdown/tools/getMultipleRowsByMultipleColumns.ts` — Multi-filter AND query
- `src/tools/markdown/utils/parser.ts` — Core parsing logic

---

## Testing Strategy

### Unit Tests

- `tests/markdown/unit/tools/getRow.test.ts`
- `tests/markdown/unit/tools/findRow.test.ts`
- `tests/markdown/unit/tools/getFirstRowByColumn.test.ts`
- `tests/markdown/unit/tools/getMultipleRowsByColumn.test.ts`
- `tests/markdown/unit/tools/getMultipleRowsByMultipleColumns.test.ts`

---

## Acceptance Criteria

- [ ] `get_row` returns the correct row by zero-based index
- [ ] `find_row` returns a single row for unique match and errors on duplicates
- [ ] `get_first_row_by_column` returns only the first matching row
- [ ] `get_multiple_rows_by_column` returns all matching rows
- [ ] `get_multiple_rows_by_multiple_columns` applies AND logic across all filter columns
- [ ] `maxRows` parameter limits results when provided
- [ ] Non-existent columns produce descriptive error messages
- [ ] Empty result sets return empty arrays (not errors)
