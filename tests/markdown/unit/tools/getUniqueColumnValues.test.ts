import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Get Unique Column Values Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should get unique values from a column in a simple markdown table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_unique_column_values",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    const uniqueValues = JSON.parse(content[0].text);
    expect(uniqueValues).toEqual(["y", "n"]);
  });

  it("should get unique values from a column with duplicates", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_unique_column_values",
      arguments: {
        filePath: fixturePath,
        columnName: "Status",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    const uniqueValues = JSON.parse(content[0].text);
    expect(uniqueValues).toEqual(["Active", "Inactive"]);
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_unique_column_values",
      arguments: {
        filePath: fixturePath,
        columnName: "NonExistent",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get unique column values");
    expect(content[0].text).toContain("Column 'NonExistent' does not exist in the table");
  });
});