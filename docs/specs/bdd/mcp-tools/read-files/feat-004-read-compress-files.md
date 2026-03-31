# Feature: Read & Compress Files

**Feature ID**: FEAT-004  
**Category**: MCP Tools / Read Files  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for reading file contents and optionally compressing code files to save tokens while preserving all content, names, and structure. Supports Kotlin, Java, TypeScript, and PHP files.

**Related Specs:**

- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Read Files tools module is registered
```

---

## Tools Covered

| Tool Name                      | Description                                                              |
| ------------------------------ | ------------------------------------------------------------------------ |
| `read_file`                    | Read the entire content of a file by absolute path                       |
| `read_multiple_files`          | Read the entire content of multiple files by their paths                 |
| `read_file_compressed`         | Read and compress a code file to save tokens                             |
| `read_multiple_files_compressed` | Read and compress multiple code files to save tokens                   |

---

## Scenarios

### Scenario 1: Read a single file

```gherkin
Given a file exists at "/path/to/file.ts" with content "export class User {}"
When the "read_file" tool is invoked with { "path": "/path/to/file.ts" }
Then the response contains the full file content: "export class User {}"
```

---

### Scenario 2: Read a non-existent file

```gherkin
Given no file exists at "/path/to/missing.ts"
When the "read_file" tool is invoked with { "path": "/path/to/missing.ts" }
Then an error is thrown: "Failed to read file: <error details>"
```

---

### Scenario 3: Read multiple files

```gherkin
Given files exist at "/path/a.ts" and "/path/b.ts"
When the "read_multiple_files" tool is invoked with { "paths": ["/path/a.ts", "/path/b.ts"] }
Then the response contains both file contents separated by "=== /path/a.ts ===" and "=== /path/b.ts ===" headers
```

---

### Scenario 4: Read multiple files with one missing

```gherkin
Given "/path/a.ts" exists but "/path/missing.ts" does not
When the "read_multiple_files" tool is invoked with { "paths": ["/path/a.ts", "/path/missing.ts"] }
Then an error is thrown listing the files that could not be read
```

---

### Scenario 5: Read and compress a Kotlin file

```gherkin
Given a Kotlin file exists at "/path/to/User.kt" with verbose formatting
When the "read_file_compressed" tool is invoked with { "path": "/path/to/User.kt" }
Then the response contains the compressed version
And all class names, function names, property names, and imports are preserved
And whitespace and formatting are reduced to save tokens
```

---

### Scenario 6: Compress supported file types

```gherkin
Given code files exist with extensions: .kt, .java, .ts, .tsx, .php
When the "read_file_compressed" tool is invoked for each file
Then each file is compressed using the language-appropriate compressor
And structure and semantics are preserved in each case
```

---

### Scenario 7: Read and compress multiple files

```gherkin
Given Kotlin files exist at "/path/a.kt" and "/path/b.kt"
When the "read_multiple_files_compressed" tool is invoked with { "paths": ["/path/a.kt", "/path/b.kt"] }
Then the response contains compressed versions of both files
And each file section is prefixed with "=== /path/a.kt ===" and "=== /path/b.kt ===" headers
```

---

### Scenario 8: Partial failure in multiple compressed reads

```gherkin
Given "/path/a.kt" exists but "/path/missing.kt" does not
And at least one file can be read
When the "read_multiple_files_compressed" tool is invoked
Then the readable file's compressed content is returned
And a WARNINGS section lists the files that failed
```

---

### Scenario 9: All files fail in multiple compressed reads

```gherkin
Given no files in the paths array exist
When the "read_multiple_files_compressed" tool is invoked
Then an error is thrown: "No files could be read: <details>"
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `read_file`, `read_multiple_files`, `read_file_compressed`, `read_multiple_files_compressed` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// read_file
z.object({ path: z.string() });

// read_multiple_files
z.object({ paths: z.array(z.string()) });

// read_file_compressed
z.object({ path: z.string() });

// read_multiple_files_compressed
z.object({ paths: z.array(z.string()) });
```

### Files

- `src/tools/read-files/tools/index.ts` — Tool registration and handlers
- `src/tools/read-files/utils/compression/index.ts` — Compression dispatcher
- `src/tools/read-files/utils/compression/kotlin.ts` — Kotlin compressor
- `src/tools/read-files/utils/compression/java.ts` — Java compressor
- `src/tools/read-files/utils/compression/typescript.ts` — TypeScript compressor
- `src/tools/read-files/utils/compression/php.ts` — PHP compressor

---

## Testing Strategy

### Unit Tests

- `tests/read-files/unit/tools/index.test.ts` — Tool handler tests
- `tests/read-files/unit/utils/compression/kotlin.test.ts` — Kotlin compression
- `tests/read-files/unit/utils/compression/java.test.ts` — Java compression
- `tests/read-files/unit/utils/compression/typescript.test.ts` — TypeScript compression
- `tests/read-files/unit/utils/compression/php.test.ts` — PHP compression

### Integration Tests

- `tests/read-files/integration/mcp-server.test.ts` — MCP protocol integration

---

## Acceptance Criteria

- [ ] `read_file` returns full file content for valid paths
- [ ] `read_multiple_files` concatenates files with path headers
- [ ] `read_file_compressed` reduces token count while preserving all semantic content
- [ ] Compression works for .kt, .java, .ts, .tsx, .php file extensions
- [ ] Non-existent files produce descriptive error messages
- [ ] Partial failures in multi-file reads return available content with warnings
- [ ] Total failure in multi-file reads throws an error
