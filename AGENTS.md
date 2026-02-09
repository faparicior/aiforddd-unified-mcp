# Agent Guide: DDD Discovery Unified MCP

As a Software Architect, I have documented the structure and workflows for this repository to assist agents and developers in navigating and contributing effectively.

## 🏗️ Architecture Overview

The `ddd-discovery-unified-mcp` is a core component of the DDD Discovery Tool ecosystem. It serves as the **backend logic** and **capabilities provider**, implementing the **Model Context Protocol (MCP)** to expose tools and resources to various clients, primarily the `aiforddd-cli` and AI assistants.

### Role in the Ecosystem

1.  **`unified-mcp` (This Directory)**
    - **Responsibility**: Provides specialized tools for DDD analysis, code modification, and knowledge retrieval.
    - **Protocol**: Implements the Model Context Protocol (MCP).
    - **Runtime**: Node.js (Requires Node >= 24).

2.  **`aiforddd-cli` (Sibling Directory)**
    - **Responsibility**: The primary consumer interface (CLI) for these tools.
    - **Interaction**: Calls `unified-mcp` tools to perform complex operations requested by the user.

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

1.  **Run Tests**: Ensure `npm test` passes locally.
2.  **Build**: Verify `npm run build` completes successfully.
3.  **Clean Commit**: Keep changes focused on specific tools or capabilities.
