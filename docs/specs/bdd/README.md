# BDD Specifications

Behavior-Driven Development specifications for the DDD Discovery Unified MCP server.

## Nomenclature

**Global Behaviours**: `gb-[category]-[number]-[name].md` → ID: `GB-[CATEGORY]-[NUMBER]`

- Example: `gb-srv-001-mcp-server-initialization.md` → `GB-SRV-001`

**Feature Specs**: `feat-[number]-[name].md` → ID: `FEAT-[NUMBER]`

- Example: `feat-001-markdown-table-parsing.md` → `FEAT-001`

This consistent naming enables easy cross-referencing and tracking.

## Quick Reference

| ID                    | Feature                          | Path                                                                                                                                   | Priority | Status         |
| --------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| **Global Behaviours** |                                  |                                                                                                                                        |          |                |
| GB-SRV-001            | MCP Server Initialization        | [\_global-behaviours/server/gb-srv-001...](./_global-behaviours/server/gb-srv-001-mcp-server-initialization.md)                         | Critical | ✅ Implemented |
| GB-SRV-002            | Tool Registry Pattern            | [\_global-behaviours/server/gb-srv-002...](./_global-behaviours/server/gb-srv-002-tool-registry.md)                                     | Critical | ✅ Implemented |
| GB-CLI-001            | CLI Tool Bridge                  | [\_global-behaviours/cli/gb-cli-001...](./_global-behaviours/cli/gb-cli-001-cli-tool-bridge.md)                                         | High     | ✅ Implemented |
| GB-CFG-001            | Configuration Reader             | [\_global-behaviours/config/gb-cfg-001...](./_global-behaviours/config/gb-cfg-001-config-reader.md)                                     | High     | ✅ Implemented |
| **MCP Tools**         |                                  |                                                                                                                                        |          |                |
| FEAT-001              | Markdown Table Parsing           | [mcp-tools/markdown/feat-001...](./mcp-tools/markdown/feat-001-markdown-table-parsing.md)                                               | High     | ✅ Implemented |
| FEAT-002              | Markdown Table Row Queries       | [mcp-tools/markdown/feat-002...](./mcp-tools/markdown/feat-002-markdown-table-row-queries.md)                                           | High     | ✅ Implemented |
| FEAT-003              | Markdown Table Mutations         | [mcp-tools/markdown/feat-003...](./mcp-tools/markdown/feat-003-markdown-table-mutations.md)                                             | High     | ✅ Implemented |
| FEAT-004              | Read & Compress Files            | [mcp-tools/read-files/feat-004...](./mcp-tools/read-files/feat-004-read-compress-files.md)                                              | High     | ✅ Implemented |
| FEAT-005              | Dependency Mapping               | [mcp-tools/dependency-mapper/feat-005...](./mcp-tools/dependency-mapper/feat-005-dependency-mapping.md)                                  | High     | ✅ Implemented |
| FEAT-006              | Bounded Context Canvas           | [mcp-tools/bounded-context-canvas/feat-006...](./mcp-tools/bounded-context-canvas/feat-006-bounded-context-canvas.md)                    | High     | ✅ Implemented |
| FEAT-007              | Manifest Generation              | [mcp-tools/code-manifest/feat-007...](./mcp-tools/code-manifest/feat-007-manifest-generation.md)                                        | High     | ✅ Implemented |
| FEAT-008              | Code Analysis                    | [mcp-tools/code-manifest/feat-008...](./mcp-tools/code-manifest/feat-008-code-analysis.md)                                              | High     | ✅ Implemented |
| FEAT-009              | Prompt & Template System         | [mcp-tools/code-manifest/feat-009...](./mcp-tools/code-manifest/feat-009-prompt-template-system.md)                                     | High     | ✅ Implemented |
| **CLI Orchestrators** |                                  |                                                                                                                                        |          |                |
| FEAT-010              | CLI Workflow Runner              | [cli/feat-010...](./cli/feat-010-cli-workflow-runner.md)                                                                                | High     | ✅ Implemented |
| FEAT-011              | Catalog Manifest CLI             | [cli/feat-011...](./cli/feat-011-catalog-manifest-cli.md)                                                                               | High     | ✅ Implemented |
| FEAT-012              | WoW Document Generation CLI      | [cli/feat-012...](./cli/feat-012-wow-document-generation-cli.md)                                                                        | High     | ✅ Implemented |

## Feature Groups

### [Global Behaviours](./_global-behaviours/)

Cross-cutting concerns that apply throughout the server.

- **Server**: [GB-SRV-001: MCP Server Initialization](./_global-behaviours/server/gb-srv-001-mcp-server-initialization.md), [GB-SRV-002: Tool Registry Pattern](./_global-behaviours/server/gb-srv-002-tool-registry.md)
- **CLI**: [GB-CLI-001: CLI Tool Bridge](./_global-behaviours/cli/gb-cli-001-cli-tool-bridge.md) — universal CLI wrapper for all MCP tools via `ddd-tool`
- **Config**: [GB-CFG-001: Configuration Reader](./_global-behaviours/config/gb-cfg-001-config-reader.md)

### [MCP Tools — Markdown](./mcp-tools/markdown/)

Markdown table parsing, querying, and manipulation tools (16 tools).

- [FEAT-001: Markdown Table Parsing](./mcp-tools/markdown/feat-001-markdown-table-parsing.md) — `echo`, `parse_markdown_table`, `count_markdown_table_rows`, `filter_and_count_rows`, `get_unique_column_values`
- [FEAT-002: Markdown Table Row Queries](./mcp-tools/markdown/feat-002-markdown-table-row-queries.md) — `get_row`, `find_row`, `get_first_row_by_column`, `get_multiple_rows_by_column`, `get_multiple_rows_by_multiple_columns`
- [FEAT-003: Markdown Table Mutations](./mcp-tools/markdown/feat-003-markdown-table-mutations.md) — `update_row_by_match`, `update_row_by_column`, `empty_column`, `add_column`, `delete_column`

### [MCP Tools — Read Files](./mcp-tools/read-files/)

File reading and token-saving compression tools (4 tools).

- [FEAT-004: Read & Compress Files](./mcp-tools/read-files/feat-004-read-compress-files.md) — `read_file`, `read_multiple_files`, `read_file_compressed`, `read_multiple_files_compressed`

### [MCP Tools — Dependency Mapper](./mcp-tools/dependency-mapper/)

Multi-language dependency analysis tools (2 tools).

- [FEAT-005: Dependency Mapping](./mcp-tools/dependency-mapper/feat-005-dependency-mapping.md) — `map_dependencies`, `find_interface_implementations`

### [MCP Tools — Bounded Context Canvas](./mcp-tools/bounded-context-canvas/)

DDD Bounded Context Canvas parsing and update tools (5 tools).

- [FEAT-006: Bounded Context Canvas](./mcp-tools/bounded-context-canvas/feat-006-bounded-context-canvas.md) — `parse_bounded_context_canvas`, `update_context_name`, `update_context_purpose`, `update_strategic_classification`, `update_domain_roles`

### [MCP Tools — Code Manifest](./mcp-tools/code-manifest/)

Code manifest generation, comparison, and analysis tools (9 tools).

- [FEAT-007: Manifest Generation](./mcp-tools/code-manifest/feat-007-manifest-generation.md) — `generate_manifest`, `compare_manifests`, `compare_with_repository`, `create_backup` + `ddd-create-code-manifest` CLI
- [FEAT-008: Code Analysis](./mcp-tools/code-manifest/feat-008-code-analysis.md) — `extract_class_info`, `find_files`, `classify_files`
- [FEAT-009: Prompt & Template System](./mcp-tools/code-manifest/feat-009-prompt-template-system.md) — `get_prompt_content`, `get_template_content`

### [CLI Orchestrators](./cli/)

Standalone CLI binaries with unique orchestration logic beyond MCP tool invocation.

- [FEAT-010: CLI Workflow Runner](./cli/feat-010-cli-workflow-runner.md) — `ddd-run`: YAML prompt parsing and Claude CLI streaming execution
- [FEAT-011: Catalog Manifest CLI](./cli/feat-011-catalog-manifest-cli.md) — `ddd-catalog-code-manifest`: iterative DDD cataloging loop
- [FEAT-012: WoW Document Generation CLI](./cli/feat-012-wow-document-generation-cli.md) — `ddd-create-wow`: multi-mode WoW document generation

## CLI Binary Coverage Map

All 6 CLI binaries defined in `package.json` → `bin` are covered:

| Binary                       | Covered By   | Rationale                                      |
| ---------------------------- | ------------ | ---------------------------------------------- |
| `ddd-mcp`                    | GB-SRV-001   | Server startup is the global behaviour          |
| `ddd-tool`                   | GB-CLI-001   | 100% wrapper — same handlers, no unique logic   |
| `ddd-create-code-manifest`   | FEAT-007     | Calls same `generateCodeManifest()` + CLI flags |
| `ddd-run`                    | FEAT-010     | Unique: YAML parsing + Claude loop              |
| `ddd-catalog-code-manifest`  | FEAT-011     | Unique: iterative cataloging loop               |
| `ddd-create-wow`             | FEAT-012     | Unique: 7-mode state machine                    |

## Shared Resources

- [Contracts & Data Structures](./_shared/contracts.md) — MCP response format, config schemas, prompt catalog
- [BDD Template](./TEMPLATE.md) — Template for creating new feature BDD specifications
- [Global Behaviour Template](./_global-behaviours/TEMPLATE.md) — Template for creating new global behaviour specs

## Status Legend

- ✅ **Implemented**: Feature is fully implemented and tested
- 🚧 **In Progress**: Currently being developed
- 📋 **Planned**: Documented but not yet implemented
- ⚠️ **Deprecated**: Being phased out

## Usage as AI Context

### For AI Assistants

**Loading Strategy**:

1. **Always load this README first** — Get overview of all features and tools
2. **Load relevant feature groups** based on task:
   - Markdown table work → load `mcp-tools/markdown/*.md`
   - Dependency analysis → load `mcp-tools/dependency-mapper/*.md`
   - Code manifest work → load `mcp-tools/code-manifest/*.md`
   - CLI orchestration → load `cli/*.md`
3. **Load shared resources** when working with data structures:
   - Load `_shared/contracts.md` for response formats and config schemas

**Checking Compliance**:
Before implementing features:

- ✅ Does it respect global behaviours (tool registry, config reader)?
- ✅ Does it follow the standard MCP response format?
- ✅ Is there a related feature already specified?
- ✅ Does the Zod input schema validate all required parameters?

### For Developers

**Before Adding Tools**:

1. Review this index for related specs
2. Check if the tool fits an existing feature group
3. Read relevant feature group documentation
4. Review shared contracts for response formats

**Adding New BDD Spec**:

1. Determine appropriate feature group
2. Copy `TEMPLATE.md` to feature group directory
3. Follow BDD format (Given-When-Then)
4. Update this README:
   - Add row to Quick Reference table
   - Add link in Feature Groups section
5. Reference related specs and global behaviours
