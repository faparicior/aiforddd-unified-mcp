import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Parse Markdown Table Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should parse a simple markdown table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/simple-table.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should parse a markdown table with alignment markers", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/aligned-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/aligned-table.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should parse a markdown table with empty cells", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/empty-cells-table.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should throw error for non-existent file", async () => {
    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: "/non/existent/file.md",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to parse markdown table");
    expect(content[0].text).toContain("no such file or directory");
  });

  it("should throw error for invalid markdown table", async () => {
    const fixturePath = resolve(__dirname, "testHelper.ts"); // Not a markdown table

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to parse markdown table");
  });

  it("should parse the first table (index 0) from a multi-table file", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/multi-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/multi-table-0.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
        tableIndex: 0,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should parse the second table (index 1) from a multi-table file", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/multi-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/multi-table-1.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
        tableIndex: 1,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should default to table index 0 when not specified", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/multi-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/multi-table-0.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should parse an empty markdown table (headers only)", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-table.md");
    const expectedJson = JSON.parse(
      readFileSync(resolve(__dirname, "../../fixtures/empty-table.json"), "utf-8")
    );

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual(expectedJson);
  });

  it("should throw error for out of bounds table index", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/multi-table.md");

    const response = await client.callTool({
      name: "parse_markdown_table",
      arguments: {
        filePath: fixturePath,
        tableIndex: 5, // Out of bounds
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Table index 5 is out of bounds");
  });
});
