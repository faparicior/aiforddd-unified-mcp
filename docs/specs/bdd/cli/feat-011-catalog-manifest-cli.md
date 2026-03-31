# Feature: Catalog Manifest CLI

**Feature ID**: FEAT-011  
**Category**: CLI Orchestrators  
**Priority**: Medium  
**Status**: ✅ Implemented

## Description

The `ddd-catalog-code-manifest` CLI binary provides a dedicated, streamlined interface for cataloguing DDD code manifests. It reads the repository configuration, resolves the manifest location, loads the `catalog-manifest` prompt, and runs Claude in a loop until all classes are catalogued (the "Catalogued" column has no empty values).

**Related Specs:**

- [FEAT-007: Manifest Generation](../mcp-tools/code-manifest/feat-007-manifest-generation.md) — generates manifests consumed here
- [FEAT-009: Prompt & Template System](../mcp-tools/code-manifest/feat-009-prompt-template-system.md) — prompt resolution
- [FEAT-010: CLI Workflow Runner](./feat-010-cli-workflow-runner.md) — generic runner (this is a specialized version)
- [GB-CFG-001: Configuration Reader](../_global-behaviours/config/gb-cfg-001-config-reader.md) — config parsing

---

## Background

```gherkin
Given the "ddd-catalog-code-manifest" CLI binary is installed
And Claude CLI is available in the system PATH
And the repository has a config file at "<repositoryPath>/.aiforddd/code_manifest.json"
And a code manifest exists at the configured destination folder
```

---

## CLI Interface

```
ddd-catalog-code-manifest [options]

Options:
  -r, --repository <path>   Path to the repository root (defaults to current directory)
  -p, --print-only           Print the generated prompt without executing Claude
  -V, --version              Output the version number
  -h, --help                 Display help
```

---

## Scenarios

### Scenario 1: Successful cataloguing in single pass

```gherkin
Given a repository with config at ".aiforddd/code_manifest.json"
And the config specifies destination_folder: ".aiforddd"
And the manifest at ".aiforddd/code-manifest.md" has 5 classes, all uncatalogued
When the user runs: ddd-catalog-code-manifest
Then the config is read and manifest location resolved
And the "catalog-manifest" prompt is loaded with manifest_path = the destination folder
And Claude CLI is invoked with the prompt
And after Claude finishes, the manifest is checked for remaining uncatalogued rows
And if all classes are catalogued: prints "Cataloguing complete! 0 uncatalogued classes remain."
And the temp prompt file is cleaned up
```

---

### Scenario 2: Multi-pass cataloguing loop

```gherkin
Given the manifest has 100 classes, and Claude catalogs 30 per pass
When the user runs: ddd-catalog-code-manifest
Then after the first Claude run, 70 classes remain uncatalogued
And the CLI prints: "Cataloguing incomplete. 70 classes remaining without a ✓ in the Catalogued column. Re-running..."
And Claude is invoked again
And the loop continues until 0 remain
And the CLI prints: "Cataloguing complete! 0 uncatalogued classes remain."
```

---

### Scenario 3: Config file not found

```gherkin
Given no config file exists at ".aiforddd/code_manifest.json"
When the user runs: ddd-catalog-code-manifest
Then the CLI prints: "Config file not found: <absolute path>"
And exits with code 1
```

---

### Scenario 4: Manifest file not found

```gherkin
Given the config file exists but no manifest has been generated
When the user runs: ddd-catalog-code-manifest
Then the CLI prints: "Manifest file not found: <path>"
And prints: "Please run ddd-create-code-manifest first."
And exits with code 1
```

---

### Scenario 5: Print-only mode

```gherkin
When the user runs: ddd-catalog-code-manifest --print-only
Then the resolved catalog-manifest prompt is printed to stdout
And Claude CLI is NOT invoked
And the CLI exits with code 0
```

---

### Scenario 6: Custom repository path

```gherkin
When the user runs: ddd-catalog-code-manifest --repository /path/to/repo
Then the config is read from "/path/to/repo/.aiforddd/code_manifest.json"
And the manifest is expected at the configured destination folder under that repository
```

---

### Scenario 7: Claude CLI failure

```gherkin
Given Claude CLI is not installed or not in PATH
When the cataloguing tool attempts to invoke Claude
Then the CLI prints: "Failed to start claude CLI. Is it installed and in your PATH?"
And the temp prompt file is cleaned up
And the CLI exits with code 1
```

---

### Scenario 8: Error checking remaining classes

```gherkin
Given Claude has finished a cataloguing pass
But checking the manifest for remaining classes fails (e.g., table structure changed)
When the CLI attempts to count uncatalogued rows
Then an error is printed: "Error checking remaining classes: <message>"
And "Aborting loop." is printed
And the loop terminates
And the temp prompt file is cleaned up
```

---

## Scenario Implementation

### Files

- `src/catalog-manifest-cli.ts` — Full CLI entry point
- `src/tools/code-manifest/core.ts` — `PromptManager` for prompt resolution
- `src/shared/config/config-reader.ts` — Configuration reading
- `src/shared/cli/claude-runner.ts` — `runClaudeWithStreaming()` helper
- `src/tools/markdown/utils/parser.ts` — `filterAndCountRows()` for progress checking

### Data Flow

```
Repository config → resolve manifest path → PromptManager.getPromptContent("catalog-manifest") →
  temp file → runClaudeWithStreaming() → filterAndCountRows(manifest, "Catalogued", "") →
  [loop if remaining > 0] → cleanup
```

---

## Testing Strategy

### Integration Tests

- `tests/cli-workflow.integration.test.ts` — Shared integration tests for CLI workflows

---

## Acceptance Criteria

- [ ] Config file is read and manifest path correctly resolved from `destination_folder`
- [ ] The `catalog-manifest` prompt is loaded with `manifest_path` set to the destination folder
- [ ] Claude is invoked in a loop until 0 uncatalogued classes remain
- [ ] Each loop iteration checks for rows where `Catalogued` column is empty
- [ ] `--print-only` prints the prompt without invoking Claude
- [ ] `--repository` overrides the default repository path
- [ ] Missing config file produces descriptive error with full path
- [ ] Missing manifest file suggests running `ddd-create-code-manifest` first
- [ ] Claude CLI failures are caught and reported
- [ ] Temp prompt files are cleaned up on success, failure, and error
