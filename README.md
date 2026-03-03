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

### Standalone Code Manifest CLI

You can also use the embedded `ddd-code-manifest` CLI to generate code manifests independently from the console.

Run it via `npx` (make sure to build the project first if running locally), passing your JSON configuration file:

```bash
npx ddd-code-manifest --config path/to/config.json
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
