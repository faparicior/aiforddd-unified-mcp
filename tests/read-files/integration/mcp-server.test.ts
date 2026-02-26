import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("MCP Server Integration Tests", () => {
  let client: Client;

  beforeAll(async () => {
    const clientInstance = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/mcp-server.js"],
    });

    await clientInstance.connect(transport);
    client = clientInstance;
  });

  afterAll(async () => {
    await client.close();
  });

  it("should list all four tools including compressed variants", async () => {
    const response = await client.listTools();

    expect(response.tools).toBeDefined();
    expect(Array.isArray(response.tools)).toBe(true);
    expect(response.tools).toHaveLength(34);

    const toolNames = response.tools.map(t => t.name).sort();
    expect(toolNames).toEqual(expect.arrayContaining([
      "read_file",
      "read_file_compressed",
      "read_multiple_files",
      "read_multiple_files_compressed"
    ]));

    const readFileTool = response.tools.find(t => t.name === "read_file");
    expect(readFileTool?.description).toBe("Read the entire content of a file by path");

    const readMultipleTool = response.tools.find(t => t.name === "read_multiple_files");
    expect(readMultipleTool?.description).toBe("Read the entire content of multiple files by their paths");

    const readFileCompressedTool = response.tools.find(t => t.name === "read_file_compressed");
    expect(readFileCompressedTool?.description).toContain("compress");

    const readMultipleCompressedTool = response.tools.find(t => t.name === "read_multiple_files_compressed");
    expect(readMultipleCompressedTool?.description).toContain("compress");
  });

  it("should call read_file tool and return file content", async () => {
    const response = await client.callTool({
      name: "read_file",
      arguments: { path: "package.json" }
    });

    const content = (response as any).content;
    expect(content).toBeDefined();
    expect(Array.isArray(content)).toBe(true);
    expect(content[0].type).toBe("text");
    // Check for some content we know is in package.json
    expect(content[0].text).toContain('"name": "@aiforddd/unified-mcp"');
  });

  it("should handle file not found error", async () => {
    const response = await client.callTool({
      name: "read_file",
      arguments: { path: "nonexistent-file.txt" }
    });

    const content = (response as any).content;
    expect((response as any).isError).toBe(true);
    expect(content).toBeDefined();
    expect(content[0].text).toContain("Failed to read file");
  });

  it("should call read_multiple_files tool and return combined file content", async () => {
    const response = await client.callTool({
      name: "read_multiple_files",
      arguments: { paths: ["package.json", "README.md"] }
    });

    const content = (response as any).content;
    expect(content).toBeDefined();
    expect(content[0].text).toContain("=== package.json ===");
    expect(content[0].text).toContain("=== README.md ===");
    expect(content[0].text).toContain("@aiforddd/unified-mcp");
  });

  it("should handle errors in read_multiple_files when some files don't exist", async () => {
    const response = await client.callTool({
      name: "read_multiple_files",
      arguments: { paths: ["package.json", "nonexistent1.txt", "nonexistent2.txt"] }
    });

    const content = (response as any).content;
    expect((response as any).isError).toBe(true);
    expect(content[0].text).toContain("Some files could not be read");
    expect(content[0].text).toContain("Failed to read nonexistent1.txt");
  });

  it("should call read_file_compressed tool and return compressed Kotlin file", async () => {
    const response = await client.callTool({
      name: "read_file_compressed",
      arguments: { path: "tests/read-files/fixtures/sample.kt" }
    });

    const content = (response as any).content;
    expect(content).toBeDefined();

    const text = content[0].text;
    expect(text).toContain("package com.example.library");
    expect(text).toContain("class BookService");
    expect(text).toContain("data class AddBookRequest");
  });

  it("should return uncompressed content for unsupported files in read_file_compressed", async () => {
    const response = await client.callTool({
      name: "read_file_compressed",
      arguments: { path: "package.json" }
    });

    const content = (response as any).content;
    expect((response as any).isError).not.toBe(true); // It should NOT error now
    expect(content[0].text).toContain('"name": "@aiforddd/unified-mcp"');
  });

  it("should call read_multiple_files_compressed and return compressed Kotlin files", async () => {
    const response = await client.callTool({
      name: "read_multiple_files_compressed",
      arguments: { paths: ["tests/read-files/fixtures/sample.kt", "tests/read-files/fixtures/simple.kt"] }
    });

    const content = (response as any).content;
    expect(content).toBeDefined();

    const text = content[0].text;
    expect(text).toContain("=== tests/read-files/fixtures/sample.kt ===");
    expect(text).toContain("=== tests/read-files/fixtures/simple.kt ===");
    expect(text).toContain("BookService");
  });

  it("should include unsupported files uncompressed in read_multiple_files_compressed", async () => {
    const response = await client.callTool({
      name: "read_multiple_files_compressed",
      arguments: { paths: ["tests/read-files/fixtures/sample.kt", "package.json"] }
    });

    const content = (response as any).content;
    expect(content).toBeDefined();

    const text = content[0].text;
    expect(text).toContain("=== tests/read-files/fixtures/sample.kt ===");
    expect(text).toContain("BookService");
    // Should NOT contain warnings section if we treat them as normal files
    // But if we want to warn, we should have implemented warning.
    // In current implementation: checks extension in compressCode? No, compressCode returns content.
    // So it treats it as success.
    expect(text).toContain("=== package.json ===");
    expect(text).toContain("@aiforddd/unified-mcp");
  });
});
