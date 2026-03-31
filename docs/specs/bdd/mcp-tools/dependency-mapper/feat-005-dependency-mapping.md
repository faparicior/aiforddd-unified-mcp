# Feature: Dependency Mapping

**Feature ID**: FEAT-005  
**Category**: MCP Tools / Dependency Mapper  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for recursively mapping source code dependencies and finding interface implementations. Supports Kotlin, Java, TypeScript, and PHP using tree-sitter parsers for accurate import/dependency extraction.

**Related Specs:**

- [FEAT-008: Code Analysis](../code-manifest/feat-008-code-analysis.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Dependency Mapper tools module is registered
And source code files exist with supported extensions (.kt, .java, .ts, .tsx, .php)
```

---

## Tools Covered

| Tool Name                       | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `map_dependencies`              | Recursively map all dependencies of a source file                    |
| `find_interface_implementations`| Find all Kotlin classes implementing a given interface               |

---

## Scenarios

### Scenario 1: Map dependencies of a source file

```gherkin
Given a Kotlin file "UserService.kt" imports "UserRepository" and "Logger"
And "UserRepository.kt" imports "DatabaseHelper"
When the "map_dependencies" tool is invoked with { "filePath": "/path/to/UserService.kt" }
Then the response contains a dependency chain with:
  | file              | depth | dependencies          |
  | UserService.kt    | 0     | UserRepository, Logger |
  | UserRepository.kt | 1     | DatabaseHelper         |
  | Logger.kt         | 1     | (none)                 |
  | DatabaseHelper.kt | 2     | (none)                 |
And a summary with totalFiles and maxDepth
```

---

### Scenario 2: Circular dependency detection

```gherkin
Given "A.kt" imports "B.kt" and "B.kt" imports "A.kt"
When the "map_dependencies" tool is invoked with { "filePath": "/path/to/A.kt" }
Then "A.kt" is processed at depth 0 with dependency "B.kt"
And "B.kt" is processed at depth 1 with dependency "A.kt"
And "A.kt" is NOT processed again (circular dependency detected via visited set)
And the response completes without infinite recursion
```

---

### Scenario 3: Max depth limit

```gherkin
Given a deep dependency chain of 15 files
When the "map_dependencies" tool is invoked with { "filePath": "/path/to/root.kt", "maxDepth": 3 }
Then dependencies are followed only up to depth 3
And a warning is logged: "Max depth 3 reached for file: <path>"
And files beyond depth 3 are not included in the chain
```

---

### Scenario 4: File not found

```gherkin
Given no file exists at "/path/to/missing.kt"
When the "map_dependencies" tool is invoked with { "filePath": "/path/to/missing.kt" }
Then the response contains an error summary: "File not found or not accessible: <path>"
And an empty dependency chain
```

---

### Scenario 5: Unsupported file extension

```gherkin
Given a file exists at "/path/to/file.py" (Python, not supported)
When the "map_dependencies" tool is invoked with { "filePath": "/path/to/file.py" }
Then the file is returned as a leaf node with no dependencies
And no error is thrown
```

---

### Scenario 6: Multi-language support

```gherkin
Given source files with the following extensions:
  | Extension | Language   | Handler          |
  | .kt       | Kotlin     | KotlinHandler    |
  | .java     | Java       | JavaHandler      |
  | .ts, .tsx | TypeScript | TypeScriptHandler|
  | .php      | PHP        | PhpHandler       |
When the "map_dependencies" tool is invoked for each file type
Then the appropriate language handler extracts and resolves dependencies
```

---

### Scenario 7: Interface implementations auto-included

```gherkin
Given "UserService.kt" imports "UserRepository.kt" which is an interface
And "UserRepositoryImpl.kt" implements the UserRepository interface
When the "map_dependencies" tool is invoked for "UserService.kt"
Then "UserRepositoryImpl.kt" is automatically discovered and included in the dependency chain
```

---

### Scenario 8: Find interface implementations

```gherkin
Given a directory contains Kotlin files
And "UserRepositoryImpl.kt" and "CachedUserRepository.kt" both implement "UserRepository"
When the "find_interface_implementations" tool is invoked with { "interfaceName": "UserRepository", "baseDir": "/path/to/src" }
Then the response contains both implementation files
And totalImplementations = 2
```

---

### Scenario 9: No implementations found

```gherkin
Given no Kotlin files in the directory implement "SomeInterface"
When the "find_interface_implementations" tool is invoked with { "interfaceName": "SomeInterface", "baseDir": "/path/to/src" }
Then the response contains an empty implementations array
And totalImplementations = 0
And a message: "No implementations found for interface SomeInterface."
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `map_dependencies`, `find_interface_implementations`                     |
| Response Type | Multi-content: JSON block + human-readable markdown summary              |
| Error Type    | Structured error in JSON response or thrown `Error`                       |

### Input Schemas

```typescript
// map_dependencies
z.object({
	filePath: z.string(),
	maxDepth: z.number().optional(), // default: 10
});

// find_interface_implementations
z.object({
	interfaceName: z.string(),
	baseDir: z.string(),
});
```

### Response Format (map_dependencies)

```json
{
	"rootFile": "/path/to/file.kt",
	"language": ".kt",
	"summary": { "totalFiles": 4, "maxDepth": 2 },
	"dependencyChain": [
		{
			"file": "UserService.kt",
			"fullPath": "/path/to/UserService.kt",
			"depth": 0,
			"dependencies": ["UserRepository.kt"],
			"unresolvedDependencies": []
		}
	]
}
```

### Files

- `src/tools/dependency-mapper/tools/index.ts` — Tool registration, `mapDependencies()` function, handlers
- `src/tools/dependency-mapper/languages/LanguageHandler.ts` — Handler interface
- `src/tools/dependency-mapper/languages/kotlin/KotlinHandler.ts` — Kotlin parser (tree-sitter)
- `src/tools/dependency-mapper/languages/typescript/TypeScriptHandler.ts` — TypeScript parser (tree-sitter)
- `src/tools/dependency-mapper/languages/java/JavaHandler.ts` — Java parser (tree-sitter)
- `src/tools/dependency-mapper/languages/php/PhpHandler.ts` — PHP parser (php-parser)

---

## Testing Strategy

### Unit Tests (per language)

- `tests/dependency-mapper/unit/kotlin/kotlin.test.ts`
- `tests/dependency-mapper/unit/typescript/typescript.test.ts`
- `tests/dependency-mapper/unit/java/java.test.ts`
- `tests/dependency-mapper/unit/php/php.test.ts`

### Integration Tests

- `tests/dependency-mapper/integration/mcp-server.test.ts`

---

## Acceptance Criteria

- [ ] `map_dependencies` recursively follows import chains up to maxDepth
- [ ] Circular dependencies are detected and do not cause infinite recursion
- [ ] Language is auto-detected by file extension
- [ ] All 4 languages (Kotlin, Java, TypeScript, PHP) are supported
- [ ] Interface implementations are automatically discovered and included
- [ ] Unresolved dependencies are tracked separately
- [ ] `find_interface_implementations` returns all implementing Kotlin classes
- [ ] File-not-found errors return structured error responses
- [ ] Response includes both JSON and human-readable markdown sections
