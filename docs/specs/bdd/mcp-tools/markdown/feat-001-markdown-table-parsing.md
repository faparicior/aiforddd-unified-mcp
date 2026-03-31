# Feature: Markdown Table Parsing

**Feature ID**: FEAT-001  
**Category**: MCP Tools / Markdown  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for parsing markdown tables into structured data, counting rows, filtering and counting by column values, retrieving unique column values, and a diagnostic echo tool. These are foundational read-only operations used by DDD classification workflows.

**Related Specs:**

- [FEAT-002: Markdown Table Row Queries](./feat-002-markdown-table-row-queries.md)
- [FEAT-003: Markdown Table Mutations](./feat-003-markdown-table-mutations.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Markdown tools module is registered
And a markdown file exists containing one or more tables with header rows and separator rows
```

---

## Tools Covered

| Tool Name                    | Description                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| `echo`                       | Echoes back the input message (diagnostic)                           |
| `parse_markdown_table`       | Parse a markdown table from a file and convert it to JSON            |
| `count_markdown_table_rows`  | Count the number of data rows in a markdown table                    |
| `filter_and_count_rows`      | Filter rows by column value and return the count of matching rows    |
| `get_unique_column_values`   | Get the distinct values present in a specific column                 |

---

## Scenarios

### Scenario 1: Echo a message

```gherkin
Given the MCP server is running
When the "echo" tool is invoked with { "message": "hello" }
Then the response contains: "Echo: hello"
```

---

### Scenario 2: Parse a markdown table to JSON

```gherkin
Given a markdown file at "/path/to/manifest.md" contains:
  | Class | Layer | Catalogued |
  | ----- | ----- | ---------- |
  | UserService | Application | ✓ |
  | UserRepo    | Infrastructure |   |
When the "parse_markdown_table" tool is invoked with { "filePath": "/path/to/manifest.md" }
Then the response contains a JSON array with 2 row objects
And each row has keys "Class", "Layer", "Catalogued"
And the first row has { "Class": "UserService", "Layer": "Application", "Catalogued": "✓" }
```

---

### Scenario 3: Parse a specific table by index

```gherkin
Given a markdown file contains multiple tables
When the "parse_markdown_table" tool is invoked with { "filePath": "/path/to/file.md", "tableIndex": 1 }
Then the second table (0-based index 1) is parsed and returned as JSON
```

---

### Scenario 4: Count rows in a markdown table

```gherkin
Given a markdown table with 15 data rows
When the "count_markdown_table_rows" tool is invoked with { "filePath": "/path/to/file.md" }
Then the response contains the count: 15
```

---

### Scenario 5: Filter and count rows by column value

```gherkin
Given a markdown table with a "Layer" column containing values "Application", "Domain", "Application"
When the "filter_and_count_rows" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Layer", "value": "Application" }
Then the response contains the count: 2
```

---

### Scenario 6: Get unique values from a column

```gherkin
Given a markdown table with a "Layer" column containing "Application", "Domain", "Application", "Infrastructure"
When the "get_unique_column_values" tool is invoked with { "filePath": "/path/to/file.md", "columnName": "Layer" }
Then the response contains: ["Application", "Domain", "Infrastructure"]
```

---

### Scenario 7: File not found

```gherkin
Given no file exists at "/nonexistent/file.md"
When any markdown tool is invoked with { "filePath": "/nonexistent/file.md" }
Then an error is returned with a message indicating the file could not be read
```

---

### Scenario 8: Table index out of range

```gherkin
Given a markdown file contains only 1 table
When the "parse_markdown_table" tool is invoked with { "filePath": "/path/to/file.md", "tableIndex": 5 }
Then an error is returned indicating the table index is out of range
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Tool Names    | `echo`, `parse_markdown_table`, `count_markdown_table_rows`, `filter_and_count_rows`, `get_unique_column_values` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                      |
| Error Type    | Thrown `Error` with descriptive message                                |

### Input Schemas

```typescript
// echo
z.object({ message: z.string() });

// parse_markdown_table
z.object({
	filePath: z.string(),
	tableIndex: z.number().optional().default(0),
});

// count_markdown_table_rows
z.object({
	filePath: z.string(),
	tableIndex: z.number().optional().default(0),
});

// filter_and_count_rows
z.object({
	filePath: z.string(),
	columnName: z.string(),
	value: z.string(),
	tableIndex: z.number().optional().default(0),
});

// get_unique_column_values
z.object({
	filePath: z.string(),
	columnName: z.string(),
	tableIndex: z.number().optional().default(0),
});
```

### Files

- `src/tools/markdown/tools/index.ts` — Tool registration
- `src/tools/markdown/tools/echo.ts` — Echo handler
- `src/tools/markdown/tools/parseMarkdownTable.ts` — Parse handler
- `src/tools/markdown/tools/countMarkdownTableRows.ts` — Count handler
- `src/tools/markdown/tools/filterAndCountRows.ts` — Filter+count handler
- `src/tools/markdown/tools/getUniqueColumnValues.ts` — Unique values handler
- `src/tools/markdown/utils/parser.ts` — Core parsing logic shared across tools

---

## Testing Strategy

### Unit Tests

- `tests/markdown/unit/tools/parseMarkdownTable.test.ts`
- `tests/markdown/unit/tools/countMarkdownTableRows.test.ts`
- `tests/markdown/unit/tools/getUniqueColumnValues.test.ts`

---

## Acceptance Criteria

- [ ] `echo` returns "Echo: <message>" for any input
- [ ] `parse_markdown_table` converts a valid markdown table to JSON array of row objects
- [ ] `count_markdown_table_rows` returns the correct count of data rows (excluding header/separator)
- [ ] `filter_and_count_rows` correctly filters by column name and value
- [ ] `get_unique_column_values` returns deduplicated values
- [ ] All tools default `tableIndex` to 0 when not provided
- [ ] File-not-found errors are returned with descriptive messages
- [ ] Invalid table index is handled gracefully
