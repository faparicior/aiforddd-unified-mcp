# Unified MCP Server

This is the unified MCP server for DDD for AI Tool Suite.

## Usage

You can run this MCP server directly using `npx` with our pre-built GitHub release (replace `{version}` with the desired release, e.g., `1.0.0`):

```bash
npx -y https://github.com/faparicior/aiforddd-unified-mcp/releases/download/v{version}/aiforddd-unified-mcp-{version}.tgz
```

### MCP Client Configuration

To use this with an MCP client (such as Claude Desktop or Cline), add the following to your MCP configuration file (replacing `{version}` with the release version, e.g., `1.0.0`):

```json
{
  "mcpServers": {
    "aiforddd": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/faparicior/aiforddd-unified-mcp/releases/download/v{version}/aiforddd-unified-mcp-{version}.tgz"
      ]
    }
  }
}
```

Or locally:

```bash
npm install
npm run build
npm start
```

## Available Tools

This MCP server provides a comprehensive suite of tools organized into functional categories:

### 1. Markdown Table Tools

Manage and manipulate markdown tables dynamically:

- `add_column` / `delete_column` / `empty_column`
- `parse_markdown_table` / `count_markdown_table_rows`
- `get_row` / `find_row` / `get_multiple_rows_by_column` / `get_multiple_rows_by_multiple_columns`
- `update_row_by_column` / `update_row_by_match`
- `filter_and_count_rows` / `get_unique_column_values` / `get_first_row_by_column`

### 2. File Reading Tools

Read files with built-in AST-based compression for source code to save context tokens:

- `read_file` / `read_multiple_files`
- `read_file_compressed` / `read_multiple_files_compressed`

### 3. Bounded Context Canvas Tools

Interact with Domain-Driven Design (DDD) Bounded Context Canvas markdown files:

- `parse_bounded_context_canvas`
- `update_context_name` / `update_context_purpose`
- `update_domain_roles` / `update_strategic_classification`

### 4. Code Manifest & Analysis Tools

Extract, classify, and track changes in codebase structures:

- `mcp_code_manifest_generate_manifest` / `mcp_code_manifest_compare_manifests`
- `mcp_code_manifest_extract_class_info` / `mcp_code_manifest_classify_files`
- `mcp_code_manifest_find_files` / `mcp_code_manifest_create_backup`
- `mcp_code_manifest_get_prompt_content`

### 5. Dependency Mapper

- `map_dependencies`: Analyzes a source code file (Kotlin, Java, TypeScript, PHP) and recursively maps its dependency chain.
- `find_interface_implementations`: Finds all Kotlin classes that implement a given interface in a directory.

## Available CLIs

The package provides the following command-line interfaces:

### `ddd-mcp`

The primary CLI to run the unified MCP server. Typically launched via an MCP client configuration or using `npx`.

### `ddd-create-code-manifest`

A standalone CLI to generate code manifests independently from the console.

Run it via `npx` (make sure to build the project first if running locally), passing your JSON configuration file:

```bash
npx ddd-create-code-manifest --config path/to/config.json
```

*Example Configuration (`config.json`):*

```json
{
  "version": "1.0",
  "destination_folder": "docs/manifests",
  "app_details": [
    {
      "path": "src/application",
      "language": "kotlin",
      "mode": "class",
      "alias": "main-app-backend",
      "type": "code"
    }
  ]
}
```

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build:

   ```bash
   npm run build
   ```

3. Run:

   ```bash
   npm start
   ```
