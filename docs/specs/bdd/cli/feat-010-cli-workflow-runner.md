# Feature: CLI Workflow Runner

**Feature ID**: FEAT-010  
**Category**: CLI Orchestrators  
**Priority**: Medium  
**Status**: ✅ Implemented

## Description

The `ddd-run` CLI binary is a generic workflow runner that executes any YAML-defined prompt via the Claude CLI. It parses the YAML prompt definition, substitutes variables, appends complementary prompts, and invokes Claude with streaming output. For the special `catalog-manifest` prompt, it implements a completion loop that re-runs until all classes are catalogued.

**Related Specs:**

- [FEAT-009: Prompt & Template System](../mcp-tools/code-manifest/feat-009-prompt-template-system.md) — prompt definitions consumed here
- [FEAT-011: Catalog Manifest CLI](./feat-011-catalog-manifest-cli.md) — dedicated catalog tool
- [Contracts: Prompt Catalog](../_shared/contracts.md) — available prompts

---

## Background

```gherkin
Given the "ddd-run" CLI binary is installed
And Claude CLI is available in the system PATH
And YAML prompt files exist at the expected locations
```

---

## CLI Interface

```
ddd-run <workflowFile> [options]

Arguments:
  workflowFile          Path to the workflow YAML file (e.g., src/prompts/catalog-manifest.yml)

Options:
  -a, --args <json>     JSON string containing the workflow arguments
  -p, --print-only      Print the generated prompt without executing Claude
  -V, --version         Output the version number
  -h, --help            Display help
```

---

## Scenarios

### Scenario 1: Execute a one-shot workflow

```gherkin
Given a YAML prompt file "my-workflow.yml" exists with messages and no completion loop
When the user runs: ddd-run my-workflow.yml
Then the YAML prompt is parsed
And the prompt messages are used as-is (no argument substitution needed)
And Claude CLI is invoked with the prompt content piped via a temp file
And the output is streamed to stdout
And the temp file is cleaned up after execution
```

---

### Scenario 2: Execute with argument substitution

```gherkin
Given a YAML prompt file with arguments: [{ name: "manifestPath", required: true }]
And messages containing "{{manifestPath}}"
When the user runs: ddd-run catalog-manifest.yml --args '{"manifestPath": "/path/to/manifest"}'
Then "{{manifestPath}}" is replaced with "/path/to/manifest" in the messages
And the resolved prompt is sent to Claude
```

---

### Scenario 3: Missing required argument

```gherkin
Given a YAML prompt with required argument "manifestPath"
When the user runs: ddd-run catalog-manifest.yml
Then the CLI prints: "Missing required argument: manifestPath"
And prints: "Provide it via: --args '{"manifestPath": "value"}'"
And exits with code 1
```

---

### Scenario 4: Invalid JSON in --args

```gherkin
When the user runs: ddd-run workflow.yml --args 'not-json'
Then the CLI prints: "Invalid JSON provided for --args: not-json"
And exits with code 1
```

---

### Scenario 5: Complementary prompts are appended

```gherkin
Given a YAML prompt with complementary_prompts: [{ name: "extra.yml" }]
And "extra.yml" exists in the same directory as the workflow file
When ddd-run executes the workflow
Then the main prompt messages are appended with the complementary prompt file contents
And the combined prompt is sent to Claude
```

---

### Scenario 6: Workflow file not found

```gherkin
Given the workflow file does not exist locally or in the bundled prompts directory
When the user runs: ddd-run nonexistent.yml
Then the CLI prints: "Workflow file not found locally or within package: nonexistent.yml"
And exits with code 1
```

---

### Scenario 7: Bundled prompt resolution

```gherkin
Given the workflow file does not exist in the current directory
But it exists as a bundled prompt inside the package (dist/prompts/ or src/prompts/)
When the user runs: ddd-run catalog-manifest.yml
Then the bundled version is resolved and used
```

---

### Scenario 8: Print-only mode

```gherkin
When the user runs: ddd-run workflow.yml --args '{"key": "val"}' --print-only
Then the fully resolved prompt is printed to stdout
And Claude CLI is NOT invoked
And the CLI exits with code 0
```

---

### Scenario 9: Catalog-manifest completion loop

```gherkin
Given the YAML prompt has name: "catalog-manifest"
And the manifest file has 10 uncatalogued classes
When ddd-run executes the workflow
Then after Claude completes, the CLI checks the manifest for rows where Catalogued=""
And if remaining > 0, prints: "Cataloguing incomplete. N classes remaining..." and re-runs Claude
And if remaining = 0, prints: "Cataloguing complete! 0 uncatalogued classes remain."
And the loop terminates
```

---

### Scenario 10: Claude CLI not available

```gherkin
Given Claude CLI is not installed or not in PATH
When ddd-run attempts to execute a workflow
Then the CLI prints: "Failed to start claude CLI. Is it installed and in your PATH?"
And exits with code 1
```

---

## Scenario Implementation

### Files

- `src/cli-workflow.ts` — Full CLI entry point with YAML parsing, argument substitution, Claude invocation, and catalog loop
- `src/shared/cli/claude-runner.ts` — `runClaudeWithStreaming()` helper

### Data Flow

```
YAML prompt file → parseYamlPrompt() → argument substitution → complementary prompts →
  temp file → runClaudeWithStreaming() → [optional loop for catalog-manifest] → cleanup
```

---

## Testing Strategy

### Integration Tests

- `tests/cli-workflow.integration.test.ts` — End-to-end workflow execution tests

---

## Acceptance Criteria

- [ ] YAML prompt files are parsed with correct extraction of name, description, arguments, complementary_prompts, messages
- [ ] Variable substitution replaces all `{{variable}}` occurrences
- [ ] Complementary prompts are concatenated to the main prompt
- [ ] Bundled prompts are resolved when local file not found
- [ ] `--print-only` outputs the prompt without invoking Claude
- [ ] Missing required arguments produce descriptive errors
- [ ] Invalid JSON args produce descriptive errors
- [ ] `catalog-manifest` prompts trigger the completion loop
- [ ] Temporary prompt files are cleaned up after execution
- [ ] Claude CLI failures are caught and reported
