import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Count Markdown Table Rows Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should count rows in a simple markdown table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "count_markdown_table_rows",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("3");
  });

  it("should count rows in a table with aligned columns", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/aligned-table.md");

    const response = await client.callTool({
      name: "count_markdown_table_rows",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("3");
  });

  it("should count rows in a table with empty cells", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    const response = await client.callTool({
      name: "count_markdown_table_rows",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("3");
  });

  it("should count 0 rows in an empty table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-table.md");

    const response = await client.callTool({
      name: "count_markdown_table_rows",
      arguments: {
        filePath: fixturePath,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("0");
  });

  it("should return error for non-existent file", async () => {
    const response = await client.callTool({
      name: "count_markdown_table_rows",
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
    expect(content[0].text).toContain("Failed to count markdown table rows");
  });

  it("should return error for invalid markdown table", async () => {
    const fixturePath = resolve(__dirname, "testHelper.ts");

    const response = await client.callTool({
      name: "count_markdown_table_rows",
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
    expect(content[0].text).toContain("Failed to count markdown table rows");
  });
});
