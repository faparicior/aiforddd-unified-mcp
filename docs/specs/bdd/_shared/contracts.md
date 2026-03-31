# Contracts & Data Structures

## MCP Tool Registry Contract

All tools are registered via the `ToolRegistry` class (`src/shared/cli/registry.ts`) and exposed over the Model Context Protocol via stdio transport.

### Tool Definition

```typescript
export interface ToolDefinition<T extends ZodTypeAny> {
	name: string;
	description: string;
	inputSchema: T; // Zod schema
	handler: (args: z.infer<T>, extra?: any) => Promise<any>;
}
```

### Standard MCP Response Format

All tool handlers return responses conforming to the MCP content array format:

```typescript
// Success response
{
  content: [
    { type: "text", text: "<result string or JSON>" }
  ]
}

// Some tools return multiple content blocks (e.g., JSON + human-readable summary)
{
  content: [
    { type: "text", text: "```json\n{...}\n```" },
    { type: "text", text: "## Human-readable summary\n..." }
  ]
}
```

### Error Handling

Tool errors are thrown as `Error` instances with descriptive messages. The MCP SDK translates these into protocol-level error responses.

```typescript
throw new Error(`Failed to read file: ${message}`);
```

---

## Configuration File Structure

### Repository Config (`<repo>/.aiforddd/code_manifest.json`)

Used by the code manifest generation tools to locate source and test files.

```json
{
	"outputPath": "/path/to/output/directory",
	"includeSources": ["src/**/*.kt"],
	"includeTests": ["tests/**/*.test.kt"]
}
```

| Field            | Type       | Required | Description                                           |
| ---------------- | ---------- | -------- | ----------------------------------------------------- |
| `outputPath`     | `string`   | ✅ Yes   | Directory where manifest files will be written        |
| `includeSources` | `string[]` | No       | Glob patterns selecting source files for the manifest |
| `includeTests`   | `string[]` | No       | Glob patterns selecting test files for the manifest   |

### Config Reader (`src/shared/config/config-reader.ts`)

Generic configuration reader with optional JSON Schema validation via Ajv.

```typescript
function readConfig<T>(configPath: string, schemaPath?: string): T;
```

| Error Condition         | Message                                                    |
| ----------------------- | ---------------------------------------------------------- |
| File not found          | `Failed to read configuration file: <path>`                |
| Invalid JSON            | `Invalid JSON in configuration file: <path>`               |
| Schema not found        | `Failed to read schema file: <path>`                       |
| Validation failure      | `Configuration file does not match the required schema`    |

---

## Manifest Generation Contracts

### Success Response (stdout JSON)

```json
{
	"generatedFiles": [
		{
			"type": "code_manifest",
			"path": "<outputPath>/code_manifest.md"
		},
		{
			"type": "tests_manifest",
			"path": "<outputPath>/tests_manifest.md"
		}
	],
	"message": "Manifests generated successfully"
}
```

### Error Response (stdout JSON, exit code non-zero)

```json
{
	"error": "<human-readable description of the failure>",
	"message": "Manifest generation failed"
}
```

### TypeScript Types

```typescript
export type ManifestResult = {
	generatedFiles: Array<{
		type: 'code_manifest' | 'tests_manifest';
		path: string;
	}>;
	message: string;
};

export type ManifestError = {
	error: string;
	message: 'Manifest generation failed';
};
```

---

## Manifest Comparison Contracts

The `compare_manifests` and `compare_with_repository` tools detect the following change types:

| Status    | Description                                    |
| --------- | ---------------------------------------------- |
| `NEW`     | File present in new manifest but not in old    |
| `CHANGED` | File hash differs between manifests            |
| `MOVED`   | File path changed but content hash matches     |
| `RENAMED` | File name changed within same directory        |
| `DELETED` | File present in old manifest but not in new    |

---

## YAML Prompt Definition Structure

Used by `ddd-run` (FEAT-010) and internally by `ddd-catalog-code-manifest` (FEAT-011) and `ddd-create-wow` (FEAT-012).

```yaml
name: prompt-name
description: Human-readable description
arguments:
  - name: argName
    required: true
complementary_prompts:
  - name: another-prompt
messages: |
  Prompt body with {{argName}} variable substitution.
```

### TypeScript Types

```typescript
interface PromptArgument {
	name: string;
	required: boolean;
}

interface ComplementaryPrompt {
	name: string;
}

interface PromptDefinition {
	name: string;
	description: string;
	arguments: PromptArgument[];
	complementary_prompts?: ComplementaryPrompt[];
	messages: string;
}
```

---

## Prompt Catalog

All YAML prompt definitions located in `src/prompts/`. These are consumed by the `get_prompt_content` MCP tool (FEAT-009) and the CLI orchestrators (FEAT-010, FEAT-011, FEAT-012).

### Workflow Prompts

| Prompt File                   | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `catalog-manifest.yml`        | DDD classification of code manifest entries             |
| `generate-initial-wow.yml`    | Initial WoW document generation from manifest          |
| `analyze-wow-chunk.yml`       | Analyze a chunk of manifest rows for WoW extraction    |
| `compose-wow-document.yml`    | Compose final WoW document from analyzed chunks        |
| `enrich-wow-document.yml`     | Enrich an existing WoW document with additional detail |

### WoW Document Prompts (per DDD artifact type)

Each artifact type has up to 3 prompt variants: `create-{type}-initial-wow`, `create-{type}-wow`, and `enrich-{type}-wow`.

| DDD Artifact Type     | Initial Prompt                              | Create Prompt                        | Enrich Prompt                        |
| --------------------- | ------------------------------------------- | ------------------------------------ | ------------------------------------ |
| `controller`          | `create-controller-initial-wow.yml`         | `create-controller-wow.yml`          | `enrich-controller-wow.yml`          |
| `event-consumer`      | `create-event-consumer-initial-wow.yml`     | `create-event-consumer-wow.yml`      | `enrich-event-consumer-wow.yml`      |
| `scheduler`           | `create-scheduler-initial-wow.yml`          | `create-scheduler-wow.yml`           | `enrich-scheduler-wow.yml`           |
| `repository`          | `create-repository-initial-wow.yml`         | `create-repository-wow.yml`          | `enrich-repository-wow.yml`          |
| `event-producer`      | `create-event-producer-initial-wow.yml`     | `create-event-producer-wow.yml`      | `enrich-event-producer-wow.yml`      |
| `api-client`          | `create-api-client-initial-wow.yml`         | `create-api-client-wow.yml`          | `enrich-api-client-wow.yml`          |
| `use-case`            | `create-use-case-initial-wow.yml`           | `create-use-case-wow.yml`            | `enrich-use-case-wow.yml`            |
| `value-object`        | `create-value-object-initial-wow.yml`       | `create-value-object-wow.yml`        | `enrich-value-object-wow.yml`        |
| `entity`              | `create-entity-initial-wow.yml`             | `create-entity-wow.yml`              | `enrich-entity-wow.yml`              |
| `domain-exception`    | `create-domain-exception-initial-wow.yml`   | `create-domain-exception-wow.yml`    | `enrich-domain-exception-wow.yml`    |
| `integration-event`   | `create-integration-event-initial-wow.yml`  | `create-integration-event-wow.yml`   | `enrich-integration-event-wow.yml`   |
| `integration-service` | `create-integration-service-initial-wow.yml`| `create-integration-service-wow.yml` | `enrich-integration-service-wow.yml` |
| `configuration`       | `create-configuration-initial-wow.yml`      | `create-configuration-wow.yml`       | `enrich-configuration-wow.yml`       |
| `response`            | `create-response-initial-wow.yml`           | `create-response-wow.yml`            | `enrich-response-wow.yml`            |

### DDD Definition Files (`src/prompts/definitions/`)

| File                                        | Purpose                                    |
| ------------------------------------------- | ------------------------------------------ |
| `ddd-definitions.md`                        | Core DDD vocabulary and concept definitions |
| `ddd-classification-rules.md`               | Rules for classifying code by DDD layer     |
| `ddd-classification-examples.md`            | Classification examples for reference       |
| `ddd-classification-critical-distinctions.md`| Key distinctions between similar patterns   |
