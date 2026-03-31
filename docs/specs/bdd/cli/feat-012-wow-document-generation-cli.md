# Feature: WoW Document Generation CLI

**Feature ID**: FEAT-012  
**Category**: CLI Orchestrators  
**Priority**: Medium  
**Status**: ✅ Implemented

## Description

The `ddd-create-wow` CLI binary generates DDD Way of Working (WoW) documents by analyzing patterns in a catalogued code manifest. It supports 14 DDD pattern types and 7 execution modes, enabling both single-pass and chunked multi-pass document generation via the Claude CLI.

**Related Specs:**

- [FEAT-007: Manifest Generation](../mcp-tools/code-manifest/feat-007-manifest-generation.md) — generates source manifests
- [FEAT-009: Prompt & Template System](../mcp-tools/code-manifest/feat-009-prompt-template-system.md) — prompt definitions
- [FEAT-011: Catalog Manifest CLI](./feat-011-catalog-manifest-cli.md) — catalogs manifest first
- [GB-CFG-001: Configuration Reader](../_global-behaviours/config/gb-cfg-001-config-reader.md)

---

## Background

```gherkin
Given the "ddd-create-wow" CLI binary is installed
And Claude CLI is available in the system PATH
And the repository has a config file at "<repositoryPath>/.aiforddd/code_manifest.json"
And a catalogued code manifest exists at the configured destination folder
```

---

## CLI Interface

```
ddd-create-wow [options]

Required:
  -t, --type <type>           Type of WoW document (see supported types below)

Options:
  -r, --repository <path>    Path to the repository root (default: ".")
  -p, --print-only            Print the generated prompt without executing Claude
  -m, --mode <mode>           Execution mode (default: "full")
  --offset <number>           For analyze mode: manifest row offset, 0-based (default: "0")
  --batch-size <number>       For analyze mode: files to analyze per chunk (default: "25")
  --chunk-index <number>      For analyze mode: chunk number for naming output (default: "0")
  --analysis-dir <path>       For compose mode: directory containing intermediate analysis files
  -V, --version               Output the version number
  -h, --help                  Display help
```

---

## Supported WoW Types (14)

| Type                 | Output File                           | Prompt                            | Layer / Category Filters                              |
| -------------------- | ------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| `controller`         | `ddd-controller-wow.md`               | `create-controller-wow`           | UI / Controller                                       |
| `event-consumer`     | `ddd-event-consumer-wow.md`           | `create-event-consumer-wow`       | UI / Event consumer                                   |
| `scheduler`          | `ddd-scheduler-wow.md`                | `create-scheduler-wow`            | UI / Scheduler                                        |
| `repository`         | `ddd-repository-wow.md`               | `create-repository-wow`           | Infrastructure / Repository                           |
| `event-producer`     | `ddd-event-producer-wow.md`           | `create-event-producer-wow`       | Infrastructure / Event producer                       |
| `api-client`         | `ddd-api-client-wow.md`               | `create-api-client-wow`           | Infrastructure / API client + Gateway                 |
| `use-case`           | `ddd-use-case-wow.md`                 | `create-use-case-wow`             | Application / Use case + Command + Query              |
| `value-object`       | `ddd-value-object-wow.md`             | `create-value-object-wow`         | Domain / Value object + Enum + Domain primitive       |
| `entity`             | `ddd-entity-wow.md`                   | `create-entity-wow`               | Domain / Entity                                       |
| `domain-exception`   | `ddd-domain-exception-wow.md`         | `create-domain-exception-wow`     | Domain + Application / Domain exception               |
| `integration-event`  | `ddd-integration-event-wow.md`        | `create-integration-event-wow`    | Infrastructure / Integration event                    |
| `integration-service`| `ddd-integration-service-wow.md`      | `create-integration-service-wow`  | Infrastructure / Integration service                  |
| `configuration`      | `ddd-configuration-wow.md`            | `create-configuration-wow`        | Infrastructure / Configuration                        |
| `response`           | `ddd-response-wow.md`                 | `create-response-wow`             | UI + Application / Response                           |

---

## Execution Modes (7)

| Mode               | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `full`             | Single-pass: send entire manifest to Claude and generate the complete WoW doc   |
| `count`            | Count unprocessed rows matching the type's filters (no Claude invocation)        |
| `analyze`          | Process a chunk of manifest rows, writing intermediate analysis to tmp/          |
| `compose`          | Combine analysis chunk files into the final WoW document                         |
| `mark-processed`   | Mark all rows matching the type's filters with Processed=✓                       |
| `generate-initial` | Generate the initial WoW document from the first batch of files                  |
| `enrich`           | Enrich an existing WoW document with additional files from a subsequent batch    |

---

## Scenarios

### Scenario 1: Full mode — single-pass generation

```gherkin
Given a catalogued manifest with "controller" classes
When the user runs: ddd-create-wow --type controller
Then the "create-controller-wow" prompt is loaded with manifest_path
And Claude CLI generates the complete WoW document
And the output is written to wow/ddd-controller-wow.md
```

---

### Scenario 2: Count mode — check remaining work

```gherkin
Given a manifest with 5 unprocessed controller classes
When the user runs: ddd-create-wow --type controller --mode count
Then the CLI outputs JSON to stdout: { "count": 5, "type": "controller", "outputExists": false }
And Claude is NOT invoked
```

---

### Scenario 3: Analyze mode — chunked analysis

```gherkin
Given a manifest with 50 repository classes
When the user runs: ddd-create-wow --type repository --mode analyze --offset 0 --batch-size 25 --chunk-index 0
Then rows 0-24 (unprocessed, matching Infrastructure/Repository) are extracted
And the "analyze-wow-chunk" prompt is loaded with files_json containing those rows
And Claude writes analysis to wow/tmp/analysis-chunk-0.md
```

---

### Scenario 4: Compose mode — merge analysis chunks

```gherkin
Given analysis files exist at wow/tmp/analysis-chunk-0.md and analysis-chunk-1.md
When the user runs: ddd-create-wow --type repository --mode compose
Then the "compose-wow-document" prompt is loaded with analysis_dir and total_chunks
And Claude combines the chunks into the final wow/ddd-repository-wow.md
```

---

### Scenario 5: Mark-processed mode

```gherkin
Given a manifest with controller rows that have not been marked "Processed"
When the user runs: ddd-create-wow --type controller --mode mark-processed
Then all rows matching Layer="User Interface Layer" AND Category="Controller" are found
And each row's "Processed" column is updated to "✓"
And the CLI outputs JSON: { "marked": N, "type": "controller" }
```

---

### Scenario 6: Generate-initial mode

```gherkin
Given no existing WoW document for "entity"
And the manifest has 40 entity classes
When the user runs: ddd-create-wow --type entity --mode generate-initial --batch-size 25
Then the first 25 unprocessed entity rows are extracted
And the "create-entity-initial-wow" prompt is loaded
And Claude generates the initial wow/ddd-entity-wow.md
```

---

### Scenario 7: Enrich mode

```gherkin
Given an existing WoW document for "entity" from generate-initial
And 15 more entity rows remain unprocessed
When the user runs: ddd-create-wow --type entity --mode enrich --offset 25 --batch-size 25 --chunk-index 1
Then rows 25-39 are extracted
And the "enrich-entity-wow" prompt is loaded with chunk details
And Claude enriches the existing wow/ddd-entity-wow.md with the new rows
```

---

### Scenario 8: Unknown type

```gherkin
When the user runs: ddd-create-wow --type unknown-type
Then the CLI prints: 'Unknown type: "unknown-type"'
And prints: "Valid values: controller, event-consumer, scheduler, ..."
And exits with code 1
```

---

### Scenario 9: Unknown mode

```gherkin
When the user runs: ddd-create-wow --type controller --mode invalid
Then the CLI prints: 'Unknown mode: "invalid"'
And prints: "Valid modes: full, count, analyze, compose, mark-processed, generate-initial, enrich"
And exits with code 1
```

---

### Scenario 10: Config or manifest not found

```gherkin
Given no config file exists at ".aiforddd/code_manifest.json"
When the user runs: ddd-create-wow --type controller
Then the CLI prints: "Config file not found: <path>"
And exits with code 1
```

---

### Scenario 11: Print-only mode

```gherkin
When the user runs: ddd-create-wow --type controller --print-only
Then the resolved prompt is printed to stdout
And Claude CLI is NOT invoked
```

---

### Scenario 12: Unprocessed row filtering

```gherkin
Given the manifest has rows with Processed="✓" and rows without
And the type filter matches 10 rows total, 3 already processed
When analyze or generate-initial mode runs
Then only the 7 unprocessed rows are included in files_json
```

---

### Scenario 13: Debug mode preserves temp files

```gherkin
Given AIFORDDD_CLAUDE_DEBUG=1 is set in the environment
When any mode executes a Claude invocation
Then the temporary prompt file is NOT deleted after execution
And a debug message is printed: "[DEBUG] Keeping temp prompt file: <path>"
```

---

## Scenario Implementation

### Files

- `src/create-wow-docs-cli.ts` — Full CLI entry point (all modes, type config, filters)
- `src/tools/code-manifest/core.ts` — `PromptManager` for prompt resolution
- `src/shared/config/config-reader.ts` — Configuration reading
- `src/shared/cli/claude-runner.ts` — `runClaudeWithStreaming()` helper
- `src/tools/markdown/utils/parser.ts` — `getMultipleRowsByMultipleColumns()`, `updateRowByColumn()` for row operations

### Key Data Structures

```typescript
// WoW type configuration
interface WowTypeConfig {
    prompt: string;           // Main prompt name
    outputFile: string;       // Output filename in wow/ directory
    initialPrompt?: string;   // generate-initial mode prompt
    enrichPrompt?: string;    // enrich mode prompt
}

// Type filter for manifest row matching
interface WowTypeFilter {
    column: string;    // Always "Category"
    value: string;     // Category value to match
    layer: string;     // Layer value to match
}
```

---

## Testing Strategy

### Integration Tests

- `tests/cli-workflow.integration.test.ts` — Shared CLI integration tests

---

## Acceptance Criteria

- [ ] All 14 WoW types are supported with correct prompt, output file, and filter mappings
- [ ] All 7 execution modes function correctly
- [ ] `full` mode produces a complete WoW document in a single Claude pass
- [ ] `count` mode returns JSON to stdout without invoking Claude
- [ ] `analyze` mode processes only the specified chunk (offset + batchSize)
- [ ] `compose` mode reads all analysis-chunk-*.md files and produces the final document
- [ ] `mark-processed` mode updates the Processed column for all matching rows
- [ ] `generate-initial` uses the type-specific initial prompt
- [ ] `enrich` uses the type-specific enrich prompt with chunk offsets
- [ ] Only unprocessed rows (Processed ≠ ✓) are included in analysis batches
- [ ] `--print-only` prints prompts without invoking Claude in all modes
- [ ] Unknown types and modes produce descriptive errors
- [ ] Debug mode preserves temp files when AIFORDDD_CLAUDE_DEBUG=1
- [ ] Temp prompt files are cleaned up under normal and error conditions
