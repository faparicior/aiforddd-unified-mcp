import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { promises as fs } from 'fs';
import { z } from 'zod';
import { compressCode } from '../utils/compression/index.js';

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer) {
  server.registerTool("read_file", {
    description: "Read the entire content of a file by path",
    inputSchema: z.object({
      path: z.string().describe("The absolute file path to read")
    })
  }, async (args) => {
    try {
      const content = await fs.readFile(args.path, 'utf-8');
      return { content: [{ type: "text", text: content }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file: ${message}`);
    }
  });

  server.registerTool("read_multiple_files", {
    description: "Read the entire content of multiple files by their paths",
    inputSchema: z.object({
      paths: z.array(z.string()).describe("Array of absolute file paths to read")
    })
  }, async (args) => {
    const results: string[] = [];
    const errors: string[] = [];

    for (const path of args.paths) {
      try {
        const content = await fs.readFile(path, 'utf-8');
        results.push(`=== ${path} ===\n${content}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to read ${path}: ${message}`);
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      throw new Error(`Some files could not be read:\n${errorMessage}`);
    }

    const combinedContent = results.join('\n\n');
    return { content: [{ type: "text", text: combinedContent }] };
  });

  server.registerTool("read_file_compressed", {
    description: "Read and compress a code file (Kotlin, Java, TypeScript, PHP) to save tokens while preserving all content, names, and structure.",
    inputSchema: z.object({
      path: z.string().describe("The absolute file path to a supported code file (.kt, .java, .ts, .tsx, .php)")
    })
  }, async (args) => {
    try {
      const content = await fs.readFile(args.path, 'utf-8');
      const compressed = compressCode(content, args.path);
      return { content: [{ type: "text", text: compressed }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file: ${message}`);
    }
  });

  server.registerTool("read_multiple_files_compressed", {
    description: "Read and compress multiple code files to save tokens while preserving all content.",
    inputSchema: z.object({
      paths: z.array(z.string()).describe("Array of absolute file paths to supported code files")
    })
  }, async (args) => {
    const results: string[] = [];
    const errors: string[] = [];

    for (const path of args.paths) {
      try {
        const content = await fs.readFile(path, 'utf-8');
        const compressed = compressCode(content, path);
        results.push(`=== ${path} ===\n${compressed}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to read ${path}: ${message}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      const errorMessage = errors.join('\n');
      throw new Error(`No files could be read:\n${errorMessage}`);
    }

    let combinedContent = results.join('\n\n');
    if (errors.length > 0) {
      combinedContent += '\n\n=== WARNINGS ===\n' + errors.join('\n');
    }
    
    return { content: [{ type: "text", text: combinedContent }] };
  });
}
