# Global Behaviour: Configuration Reader

**Feature ID**: GB-CFG-001  
**Category**: Config  
**Priority**: High  
**Status**: ✅ Implemented

## Description

The configuration reader is a generic utility for loading and validating JSON configuration files. It supports optional JSON Schema (Ajv) validation and provides clear error messages for each failure mode.

**Applies To:**

- Code manifest generation (FEAT-007) — reads `<repo>/.aiforddd/code_manifest.json`
- Any tool or CLI that requires configuration from a JSON file

---

## Scenarios

### Scenario 1: Read a valid config file

```gherkin
Given a valid JSON file exists at "/path/to/config.json"
When readConfig("/path/to/config.json") is called
Then the file is read and parsed as JSON
And the parsed object is returned typed as T
```

---

### Scenario 2: Config file not found

```gherkin
Given no file exists at "/path/to/missing.json"
When readConfig("/path/to/missing.json") is called
Then an Error is thrown: "Failed to read configuration file: /path/to/missing.json"
```

---

### Scenario 3: Config file contains invalid JSON

```gherkin
Given a file at "/path/to/bad.json" contains "{ not valid json }"
When readConfig("/path/to/bad.json") is called
Then an Error is thrown: "Invalid JSON in configuration file: /path/to/bad.json"
```

---

### Scenario 4: Config validated against JSON Schema (valid)

```gherkin
Given a valid config file and a valid JSON schema file
When readConfig(configPath, schemaPath) is called
Then the config is parsed
And validated against the schema using Ajv
And the validated config is returned
```

---

### Scenario 5: Config fails schema validation

```gherkin
Given a config file that does not conform to the provided JSON schema
When readConfig(configPath, schemaPath) is called
Then validation errors are logged to stderr with instance paths and messages
And an Error is thrown: "Configuration file does not match the required schema"
```

---

### Scenario 6: Schema file not found

```gherkin
Given a valid config file but the schema file does not exist
When readConfig(configPath, schemaPath) is called
Then an Error is thrown: "Failed to read schema file: <schemaPath>"
```

---

### Scenario 7: Schema file contains invalid JSON

```gherkin
Given a valid config file but the schema file contains invalid JSON
When readConfig(configPath, schemaPath) is called
Then an Error is thrown: "Invalid JSON in schema file: <schemaPath>"
```

---

## Data Contract

### Function Signature

```typescript
function readConfig<T>(configPath: string, schemaPath?: string): T;
```

### Error Summary

| Condition             | Error Message                                              |
| --------------------- | ---------------------------------------------------------- |
| Config not found      | `Failed to read configuration file: <path>`                |
| Config invalid JSON   | `Invalid JSON in configuration file: <path>`               |
| Schema not found      | `Failed to read schema file: <path>`                       |
| Schema invalid JSON   | `Invalid JSON in schema file: <path>`                      |
| Validation failure    | `Configuration file does not match the required schema`    |

---

## Implementation Details

### Affected Components

- `src/shared/config/config-reader.ts` — `readConfig()` function
- Uses `ajv` library for JSON Schema validation

### Related Specs & Behaviours

- [FEAT-007: Manifest Generation](../../mcp-tools/code-manifest/feat-007-manifest-generation.md) — uses config reader for repository config
- [Contracts: Configuration File Structure](../../_shared/contracts.md) — defines config schema

### Testing

- `tests/shared/config/config-reader.test.ts` — unit tests for all error scenarios
