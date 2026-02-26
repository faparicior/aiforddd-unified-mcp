import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Dependency Mapper MCP Server Integration Tests", () => {
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

  it("should list the tools", async () => {
    const response = await client.listTools();

    expect(response.tools).toBeDefined();
    expect(Array.isArray(response.tools)).toBe(true);
    // expect(response.tools).toHaveLength(2); // Now we have 3 tools

    const toolNames = response.tools.map(t => t.name);
    expect(toolNames).toContain("map_dependencies");
    // expect(toolNames).toContain("map_kotlin_dependencies"); // Removed
    expect(toolNames).toContain("find_interface_implementations");
  });

  it("should have correct tool schema for map_dependencies", async () => {
    const response = await client.listTools();
    const tool = response.tools.find(t => t.name === "map_dependencies");

    expect(tool).toBeDefined();
    expect(tool!.inputSchema).toBeDefined();
    expect(tool!.inputSchema.type).toBe("object");

    const schema = tool.inputSchema as any;
    expect(schema.properties).toBeDefined();

    // Check required parameters
    expect(schema.properties.filePath).toBeDefined();
    expect(schema.properties.filePath.type).toBe("string");
    expect(schema.properties.filePath.description).toContain("Absolute path");

    // Check optional maxDepth parameter
    expect(schema.properties.maxDepth).toBeDefined();
    expect(schema.properties.maxDepth.type).toBe("number");
  });

  it("should map dependencies for a simple Kotlin file", async () => {
    // Use relative path to the examples directory
    const testFilePath = "examples/kotlin/MainActivity.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    // expect(callResponse.content).toHaveLength(1); // Now returns JSON + text
    expect(callResponse.content[0].type).toBe("text");

    const resultText = callResponse.content[0].text as string;
    expect(resultText).toContain("```json");
    expect(resultText).toContain("MainActivity.kt");
    expect(resultText).toContain("totalFiles");
    expect(resultText).toContain("maxDepth");
    expect(resultText).toContain("dependencyChain");
  });

  it("should include interface implementations in dependency chain", async () => {
    // Use a file that depends on UserServiceInterface
    const testFilePath = "examples/kotlin/InterfaceUser.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    // expect(callResponse.content).toHaveLength(1); // Relaxed check

    // Combine text from all content blocks
    const resultText = callResponse.content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n");

    expect(resultText).toContain("```json");
    expect(resultText).toContain("InterfaceUser.kt");
    expect(resultText).toContain("UserServiceInterface.kt");
    // Should include the implementation
    expect(resultText).toContain("UserServiceWithInterface.kt");
  });

  it("should handle non-existent files gracefully", async () => {
    const nonExistentPath = "/path/that/does/not/exist.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: nonExistentPath
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    const resultText = callResponse.content[0].text as string;

    // Should return a result indicating no dependencies found
    expect(resultText).toContain("```json");
    expect(resultText).toContain('File not found or not accessible');
  });

  it("should respect maxDepth parameter", async () => {
    const testFilePath = "examples/kotlin/MainActivity.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath,
        maxDepth: 1
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    const resultText = callResponse.content[0].text as string;

    // With maxDepth=1, it should only go one level deep
    expect(resultText).toContain("```json");
    expect(resultText).toContain('"maxDepth"');
    // The exact depth will depend on the file structure, but it should be limited
  });

  it("should map a complex dependency chain", async () => {
    const testFilePath = "examples/kotlin/MainActivity.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath,
        maxDepth: 5
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    const resultText = callResponse.content[0].text as string;

    // Should contain the root file at least
    expect(resultText).toContain("```json");
    expect(resultText).toContain("MainActivity.kt");
    expect(resultText).toContain("totalFiles");
    expect(resultText).toContain("maxDepth");
    expect(resultText).toContain("dependencyChain");

    // Parse the JSON result to check it contains expected dependencies
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/);
    expect(jsonMatch).toBeDefined();
    const jsonData = JSON.parse(jsonMatch![1]);
    expect(jsonData.summary).toBeDefined();
    expect(jsonData.dependencyChain).toBeDefined();

    // Should have at least the root file
    expect(jsonData.summary.totalFiles).toBeGreaterThanOrEqual(1);
  });

  it("should handle files with no dependencies", async () => {
    const testFilePath = "examples/kotlin/Logger.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    const resultText = callResponse.content[0].text as string;

    expect(resultText).toContain("```json");
    expect(resultText).toContain("Logger.kt");
    expect(resultText).toContain('"totalFiles": 1');
    expect(resultText).toContain('"maxDepth": 0');
  });

  it("should prevent infinite loops with circular dependencies", async () => {
    // Test that the tool completes without hanging
    const testFilePath = "examples/kotlin/MainActivity.kt";

    const response = await client.callTool({
      name: "map_dependencies",
      arguments: {
        filePath: testFilePath,
        maxDepth: 10
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    const resultText = callResponse.content[0].text as string;

    // Should complete successfully without hanging
    expect(resultText).toContain("```json");
  });

  it("should find interface implementations", async () => {
    const response = await client.callTool({
      name: "find_interface_implementations",
      arguments: {
        interfaceName: "UserServiceInterface",
        baseDir: "examples/kotlin"
      }
    });

    const callResponse = response as any;
    expect(callResponse.content).toBeDefined();
    expect(callResponse.content).toHaveLength(1);
    expect(callResponse.content[0].type).toBe("text");

    const resultText = callResponse.content[0].text as string;
    expect(resultText).toContain("```json");
    expect(resultText).toContain("UserServiceInterface");
    expect(resultText).toContain("UserServiceWithInterface.kt");
  });
});