# Feature: Prompt & Template System

**Feature ID**: FEAT-009  
**Category**: MCP Tools / Code Manifest  
**Priority**: High  
**Status**: ✅ Implemented

## Description

Provides MCP tools for retrieving prompt definitions and template files with argument substitution. The prompt system uses YAML-defined prompts with `{{variable}}` placeholders and optional complementary prompt inclusion. Templates are raw markdown files used for WoW document structure.

**Related Specs:**

- [FEAT-010: CLI Workflow Runner](../../cli/feat-010-cli-workflow-runner.md) — consumes prompts for Claude execution
- [FEAT-011: Catalog Manifest CLI](../../cli/feat-011-catalog-manifest-cli.md) — uses prompt content for cataloging
- [FEAT-012: WoW Document Generation CLI](../../cli/feat-012-wow-document-generation-cli.md) — uses templates for WoW docs
- [Contracts: Prompt Catalog](../../_shared/contracts.md) — full catalog of available prompts
- [GB-SRV-002: Tool Registry Pattern](../../_global-behaviours/server/gb-srv-002-tool-registry.md)

---

## Background

```gherkin
Given the MCP server is running
And the Code Manifest tools module is registered
And YAML prompt files exist in src/prompts/
And template files exist in src/prompts/templates/
```

---

## Tools Covered

| Tool Name             | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `get_prompt_content`  | Get a prompt template with arguments filled in, ready for execution    |
| `get_template_content`| Get the raw content of a template file                                 |

---

## Scenarios

### Scenario 1: Get prompt content with arguments

```gherkin
Given a YAML prompt "catalog-manifest.yml" exists with:
  - arguments: [{ name: "manifestPath", required: true }]
  - messages containing "{{manifestPath}}"
When the "get_prompt_content" tool is invoked with:
  { "promptName": "catalog-manifest", "arguments": { "manifestPath": "/path/to/manifest.md" } }
Then the response contains the prompt messages with "{{manifestPath}}" replaced by "/path/to/manifest.md"
```

---

### Scenario 2: Get prompt content without arguments

```gherkin
Given a YAML prompt exists that requires no arguments
When the "get_prompt_content" tool is invoked with { "promptName": "some-prompt" }
Then the response contains the raw prompt messages with no substitution
```

---

### Scenario 3: Prompt not found

```gherkin
Given no prompt file exists for "nonexistent-prompt"
When the "get_prompt_content" tool is invoked with { "promptName": "nonexistent-prompt" }
Then an error is returned indicating the prompt was not found
```

---

### Scenario 4: Missing required argument

```gherkin
Given a prompt requires argument "manifestPath" (required: true)
When the "get_prompt_content" tool is invoked with { "promptName": "catalog-manifest", "arguments": {} }
Then an error is returned indicating the required argument is missing
```

---

### Scenario 5: Complementary prompts are included

```gherkin
Given a prompt has complementary_prompts referencing other YAML files
When the "get_prompt_content" tool is invoked
Then the complementary prompt messages are loaded and appended to the main prompt content
```

---

### Scenario 6: Get template content

```gherkin
Given a template file exists at "src/prompts/templates/wow/template-ddd-use-case-wow.md"
When the "get_template_content" tool is invoked with { "templatePath": "wow/template-ddd-use-case-wow.md" }
Then the response contains the raw markdown content of the template file
```

---

### Scenario 7: Template not found

```gherkin
Given no template file exists at the specified path
When the "get_template_content" tool is invoked with { "templatePath": "nonexistent/template.md" }
Then an error is returned indicating the template was not found
```

---

## Scenario Implementation

### MCP Tool Interface

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Tool Names    | `get_prompt_content`, `get_template_content`                             |
| Response Type | `{ content: [{ type: "text", text: string }] }`                         |
| Error Type    | Thrown `Error` with descriptive message                                   |

### Input Schemas

```typescript
// get_prompt_content
z.object({
	promptName: z.string(),
	arguments: z.record(z.string(), z.any()).optional(),
});

// get_template_content
z.object({
	templatePath: z.string(),
});
```

### Variable Substitution

Prompts use `{{variableName}}` syntax for placeholder replacement:

```yaml
messages: |
  Analyze the manifest at {{manifestPath}}.
  The repository is at {{repositoryPath}}.
```

After substitution with `{ "manifestPath": "/data/manifest.md", "repositoryPath": "/repo" }`:

```text
Analyze the manifest at /data/manifest.md.
The repository is at /repo.
```

### Files

- `src/tools/code-manifest/register.ts` — Tool registration
- `src/tools/code-manifest/tools/index.ts` — Tool handlers
- `src/tools/code-manifest/core.ts` — `PromptManager` class
- `src/prompts/*.yml` — YAML prompt definitions (see [Contracts: Prompt Catalog](../../_shared/contracts.md))
- `src/prompts/templates/` — Raw template files
- `src/prompts/definitions/` — DDD definition reference files

---

## Testing Strategy

### Integration Tests

- `tests/code-manifest/integration/prompt-server.test.ts` — Prompt resolution tests via MCP
- `tests/code-manifest/integration/mcp-server.test.ts` — General MCP tool tests

---

## Acceptance Criteria

- [ ] `get_prompt_content` resolves prompt by name and substitutes `{{variables}}`
- [ ] Missing required arguments produce descriptive errors
- [ ] Non-existent prompts produce descriptive errors
- [ ] Complementary prompts are loaded and included automatically
- [ ] `get_template_content` returns raw file content for valid paths
- [ ] Non-existent templates produce descriptive errors
- [ ] All 46+ YAML prompts in `src/prompts/` are accessible by name
