# Feature: Code Analysis

**Feature ID**: FEAT-008  
**Category**: MCP Tools / Code Manifest  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for extracting class structure from source files, finding files by extension, and classifying files by their DDD layer and pattern. These tools support the manifest generation and cataloging workflows.

**Related Specs:**

- [FEAT-007: Manifest Generation](./feat-007-manifest-generation.md)
- [FEAT-005: Dependency Mapping](../dependency-mapper/feat-005-dependency-mapping.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Code Manifest tools module is registered
And source code files exist in the target directory
```

---

## Tools Covered

| Tool Name           | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `extract_class_info`| Extract class structure from a source file (package, imports, classes, properties, functions, constants) |
| `find_files`        | Recursively find all files matching a file extension suffix              |
| `classify_files`    | Classify files by their class information and return structured data     |

---

## Scenarios

### Scenario 1: Extract class info from a Kotlin file

```gherkin
Given a Kotlin file at "/path/to/UserService.kt" containing:
  - package declaration
  - import statements
  - class with properties and functions
When the "extract_class_info" tool is invoked with { "filePath": "/path/to/UserService.kt" }
Then the response contains structured JSON with:
  - package name
  - list of imports
  - class name and type (class/interface/object)
  - properties with types
  - functions with parameter types and return types
  - constants
```

---

### Scenario 2: Extract info from file with multiple classes

```gherkin
Given a source file containing multiple class declarations
When the "extract_class_info" tool is invoked
Then all classes, interfaces, and objects in the file are extracted
```

---

### Scenario 3: Find files by extension

```gherkin
Given a directory structure at "/path/to/src" containing:
  - src/User.kt
  - src/service/UserService.kt
  - src/README.md
  - src/test/UserTest.kt
When the "find_files" tool is invoked with { "folder": "/path/to/src", "suffix": ".kt" }
Then the response contains:
  - src/User.kt
  - src/service/UserService.kt
  - src/test/UserTest.kt
And README.md is excluded
```

---

### Scenario 4: Find files with no matches

```gherkin
Given a directory with no .java files
When the "find_files" tool is invoked with { "folder": "/path/to/src", "suffix": ".java" }
Then the response contains an empty list
```

---

### Scenario 5: Classify files by DDD layer

```gherkin
Given a directory at "/path/to/src" containing Kotlin files
When the "classify_files" tool is invoked with { "folder": "/path/to/src", "suffix": ".kt" }
Then each file is analyzed for its class structure
And structured classification data is returned including:
  - file path
  - class names and types
  - inferred DDD categories/layers
```

---

### Scenario 6: Find files default suffix

```gherkin
Given the default suffix is ".kt"
When the "classify_files" tool is invoked with { "folder": "/path/to/src" }
Then files are filtered using the default ".kt" suffix
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `extract_class_info`, `find_files`, `classify_files`                     |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// extract_class_info
z.object({ filePath: z.string() });

// find_files
z.object({
	folder: z.string(),
	suffix: z.string(),
});

// classify_files
z.object({
	folder: z.string(),
	suffix: z.string().optional().default('.kt'),
});
```

### Files

- `src/tools/code-manifest/register.ts` — Tool registration
- `src/tools/code-manifest/tools/index.ts` — Tool handlers
- `src/tools/code-manifest/classifier/parsers/index.ts` — `extractClassStructure()` function

---

## Testing Strategy

### Integration Tests

- `tests/code-manifest/integration/mcp-server.test.ts` — MCP protocol tests

---

## Acceptance Criteria

- [ ] `extract_class_info` extracts package, imports, classes, properties, functions, and constants
- [ ] `find_files` recursively searches directories and filters by extension
- [ ] `classify_files` produces structured data for DDD categorization
- [ ] Default suffix for `classify_files` is ".kt" when not provided
- [ ] Empty directories or no-match scenarios return empty results (not errors)
- [ ] Non-existent file paths produce descriptive error messages
