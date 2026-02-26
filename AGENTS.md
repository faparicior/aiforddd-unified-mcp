# Agent Guide: DDD Discovery Unified MCP

As a Software Architect, I have documented the structure and workflows for this repository to assist agents and developers in navigating and contributing effectively.

## 🏗️ Architecture Overview

The `ddd-discovery-unified-mcp` is a core component of the DDD Discovery Tool ecosystem. It serves as the **backend logic** and **capabilities provider**, implementing the **Model Context Protocol (MCP)** to expose tools and resources to various MCP clients and AI assistants.

### Role in the Ecosystem

This repository provides specialized tools for DDD analysis, code modification, and knowledge retrieval.

By implementing the **Model Context Protocol (MCP)** natively, it acts as an agnostic tool provider. Any standard MCP client (such as Claude Desktop, Cline, or custom CLIs) can connect to it securely and harness these capabilities to perform complex operations.

## 📂 Project Structure

```text
ddd-discovery-unified-mcp/
├── src/
│   ├── mcp-server.ts  # Entry point (MCP Server setup)
│   ├── tools/         # Individual tool implementations
│   └── prompts/       # Agent logic and prompt templates
├── prompts/           # Core prompt definitions (YAML/Markdown)
├── tests/             # Testing directory (Vitest)
├── dist/              # Compiled output
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vitest.config.ts   # Test configuration
```

## 🚀 Development Workflow

### Setup & Installation

Ensure you are using **Node.js >= 24**.

```bash
npm install
```

### Common Commands

| Task         | Command          | Description                                         |
| ------------ | ---------------- | --------------------------------------------------- |
| **Build**    | `npm run build`  | Compiles TypeScript to `dist/` and copies assets.   |
| **Dev Mode** | `npm run dev`    | Runs TypeScript in watch mode for development.      |
| **Test**     | `npm test`       | Runs the full test suite using Vitest.              |
| **Start**    | `npm start`      | Runs the server from `dist/mcp-server.js`.          |

### Coding Standards

- **TypeScript**: Strict mode is enabled. Ensure type safety.
- **MCP Pattern**: Tools should be implemented in `src/tools/` and registered in `src/mcp-server.ts`.
- **Prompt Definition**: Agents are defined in `prompts/`.

## 🏷️ Versioning & Releases

Currently, the project is in an early stage and follows an **Alpha Versioning Strategy**:

- **Format**: `MAJOR.MINOR.PATCH-alpha.X` (e.g., `1.0.0-alpha.1`).
- **Nomenclature**: We strictly use the `-alpha.X` suffix in `package.json` to denote prerelease versions until the API and functionality stabilize.

### Release Workflow

Releases are distributed as pre-built `.tgz` tarballs via GitHub Releases, bypassing the need for end-users to compile TypeScript locally.

1. **Bump Version**: Update the version string in `package.json` to the new `-alpha.X` iteration.
2. **Commit & Push**: Push the version bump to the main branch.
3. **Draft Release**: Create a new Release on GitHub matching the new tag (e.g., `v1.0.0-alpha.1`) and mark it as a **Pre-release**.
4. **Automated Publish**: A GitHub Action (`release.yml`) will automatically trigger, build the TypeScript files, pack the repository (`npm pack`), and attach the `aiforddd-unified-mcp-[version].tgz` asset to the release.
5. **Usage**: The CLI and MCP clients can natively execute the pre-built tarball via: `npx -y https://github.com/faparicior/aiforddd-unified-mcp/releases/download/v[version]/aiforddd-unified-mcp-[version].tgz`.

## 🧪 Testing Strategy

We rely on **Vitest** for testing the MCP tools and server logic.

### Key Concepts

- **Location**: Tests are found in the `tests/` directory.
- **Runners**: **Vitest** (configured in `vitest.config.ts`).
- **Structure**:
  - **Unit Tests**: Test individual tool functions in isolation.
  - **Integration Tests**: Verify tool interactions and expected outputs.

### Running Tests

- `npm test`: Runs `vitest run` to execute all tests.

## 📦 Pull Request Instructions

1. **Run Tests**: Ensure `npm test` passes locally.
2. **Build**: Verify `npm run build` completes successfully.
3. **Clean Commit**: Keep changes focused on specific tools or capabilities.
