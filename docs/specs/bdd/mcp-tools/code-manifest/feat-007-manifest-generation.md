# Feature: Manifest Generation

**Feature ID**: FEAT-007  
**Category**: MCP Tools / Code Manifest  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for generating code and test manifests, comparing manifest versions to detect changes, comparing manifests against the repository state, and creating backups. Also documents the `ddd-create-code-manifest` CLI binary which calls the same core logic with additional CLI-specific flags.

**Related Specs:**

- [FEAT-008: Code Analysis](./feat-008-code-analysis.md)
- [FEAT-009: Prompt & Template System](./feat-009-prompt-template-system.md)
- [FEAT-011: Catalog Manifest CLI](../../cli/feat-011-catalog-manifest-cli.md) — uses manifests generated here
- [GB-CFG-001: Configuration Reader](../../_global-behaviours/config/gb-cfg-001-config-reader.md)
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Code Manifest tools module is registered
And a repository exists with a config file at "<repositoryPath>/.aiforddd/code_manifest.json"
```

---

## Tools Covered

| Tool Name                 | Description                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| `generate_manifest`       | Generate code and test manifests from a repository configuration           |
| `compare_manifests`       | Compare two manifest files, showing NEW/CHANGED/MOVED/RENAMED/DELETED      |
| `compare_with_repository` | Compare a manifest against its repository backup                           |
| `create_backup`           | Create a backup copy of a manifest file                                    |

---

## Scenarios

### Scenario 1: Generate manifests from repository config

```gherkin
Given a repository at "/path/to/repo"
And a config file at "/path/to/repo/.aiforddd/code_manifest.json" specifying outputPath, includeSources, and includeTests
When the "generate_manifest" tool is invoked with { "repositoryPath": "/path/to/repo" }
Then the tool reads the config file
And generates "code_manifest.md" at the configured outputPath
And generates "tests_manifest.md" at the configured outputPath
And the response confirms success with paths to generated files:
  | Field                   | Value                              |
  | generatedFiles[0].type  | "code_manifest"                    |
  | generatedFiles[0].path  | "<outputPath>/code_manifest.md"    |
  | generatedFiles[1].type  | "tests_manifest"                   |
  | generatedFiles[1].path  | "<outputPath>/tests_manifest.md"   |
  | message                 | "Manifests generated successfully" |
```

---

### Scenario 2: Config file not found

```gherkin
Given no config file exists at "/path/to/repo/.aiforddd/code_manifest.json"
When the "generate_manifest" tool is invoked with { "repositoryPath": "/path/to/repo" }
Then an error is returned: "Config file not found: <absolute path>"
```

---

### Scenario 3: Compare two manifest files

```gherkin
Given an old manifest at "/path/old_manifest.md" and a new manifest at "/path/new_manifest.md"
When the "compare_manifests" tool is invoked with { "oldFile": "/path/old_manifest.md", "newFile": "/path/new_manifest.md" }
Then the response lists entries with their change status:
  | Status  | Description                                |
  | NEW     | File in new manifest but not in old        |
  | CHANGED | File exists in both but hash differs       |
  | MOVED   | Path changed but content hash matches      |
  | RENAMED | Name changed within same directory          |
  | DELETED | File in old manifest but not in new        |
```

---

### Scenario 4: Compare manifest with repository backup

```gherkin
Given a manifest file and its corresponding backup in the repository backup directory
When the "compare_with_repository" tool is invoked with { "manifestPath": "/path/to/code_manifest.md" }
Then the tool locates the repository backup
And compares the current manifest against the backup
And returns the change summary
```

---

### Scenario 5: Create manifest backup

```gherkin
Given a manifest file at "/path/to/code_manifest.md"
When the "create_backup" tool is invoked with { "filePath": "/path/to/code_manifest.md" }
Then a backup copy is created in the repository backup directory
And the response confirms the backup path
```

---

## CLI Invocation (`ddd-create-code-manifest`)

The `ddd-create-code-manifest` binary exposes the same `generateCodeManifest()` function plus additional CLI-specific flags.

### CLI Flags

| Flag                     | Description                                              | MCP Tool Equivalent       |
| ------------------------ | -------------------------------------------------------- | ------------------------- |
| `--repository <path>`   | Repository path (default: `.`)                            | `generate_manifest`       |
| `--info <file>`          | Extract class structure from a file                       | `extract_class_info` (FEAT-008) |
| `--compare-old <file>`  | Old manifest for comparison                               | `compare_manifests`       |
| `--compare-new <file>`  | New manifest for comparison                               | `compare_manifests`       |
| `--compare-repo <file>` | Compare manifest against repository backup                | `compare_with_repository` |
| `--backup <file>`        | Create backup of a manifest file                          | `create_backup`           |
| `--prompt <name>`        | Get prompt content by name                                | `get_prompt_content` (FEAT-009) |
| `--prompt-args <json>`  | JSON arguments for prompt template                        | `get_prompt_content` (FEAT-009) |

### CLI Generation Example

```bash
# Generate manifests (same as MCP generate_manifest tool)
ddd-create-code-manifest --repository /path/to/repo

# Compare manifests (same as MCP compare_manifests tool)
ddd-create-code-manifest --compare-old /old.md --compare-new /new.md

# Create backup (same as MCP create_backup tool)
ddd-create-code-manifest --backup /path/to/code_manifest.md
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `generate_manifest`, `compare_manifests`, `compare_with_repository`, `create_backup` |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | JSON error object or thrown `Error`                                       |

### Input Schemas

```typescript
// generate_manifest
z.object({ repositoryPath: z.string().optional().default('.') });

// compare_manifests
z.object({ oldFile: z.string(), newFile: z.string() });

// compare_with_repository
z.object({ manifestPath: z.string() });

// create_backup
z.object({ filePath: z.string() });
```

### Files

- `src/tools/code-manifest/register.ts` — Tool registration
- `src/tools/code-manifest/tools/index.ts` — Tool handlers
- `src/tools/code-manifest/core.ts` — `generateCodeManifest()` core function
- `src/tools/code-manifest/main.ts` — `ddd-create-code-manifest` CLI entry point
- `src/tools/code-manifest/classifier/comparison/index.ts` — CompareCommand
- `src/tools/code-manifest/classifier/comparison/hash-comparer.ts` — MarkdownParser for comparisons

---

## Testing Strategy

### Integration Tests

- `tests/code-manifest/integration/mcp-server.test.ts` — MCP protocol tests
- `tests/code-manifest/integration/main.test.ts` — CLI binary tests
- `tests/code-manifest/integration/full-workflow.test.ts` — End-to-end manifest workflow

---

## Acceptance Criteria

- [ ] `generate_manifest` creates both code_manifest.md and tests_manifest.md
- [ ] Generated manifests include file paths, class info, and content hashes
- [ ] `compare_manifests` detects all 5 change types (NEW, CHANGED, MOVED, RENAMED, DELETED)
- [ ] `compare_with_repository` locates and compares against the backup automatically
- [ ] `create_backup` copies the file to the backup directory
- [ ] Config-not-found errors include the full expected path
- [ ] CLI binary `ddd-create-code-manifest` produces identical results to MCP tools
- [ ] All CLI flags map to corresponding MCP tool behaviour
