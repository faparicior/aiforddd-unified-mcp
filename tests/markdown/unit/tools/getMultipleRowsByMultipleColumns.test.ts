import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Get Multiple Rows by Multiple Columns Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should get rows matching multiple column values", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_multiple_columns",
      arguments: {
        filePath: fixturePath,
        filters: {
          Department: "Engineering",
          Status: "Active",
        },
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      ID: "1",
      Name: "Alice",
      Department: "Engineering",
      Status: "Active",
    });
  });

  it("should return empty array when no rows match all filters", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_multiple_columns",
      arguments: {
        filePath: fixturePath,
        filters: {
          Name: "John",
          Age: "30", // John is 25, so no match
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should get multiple rows when multiple match all filters", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_multiple_columns",
      arguments: {
        filePath: fixturePath,
        filters: {
          Department: "Engineering",
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result).toEqual([
      {
        ID: "1",
        Name: "Alice",
        Department: "Engineering",
        Status: "Active",
      },
      {
        ID: "3",
        Name: "Charlie",
        Department: "Engineering",
        Status: "Inactive",
      },
    ]);
  });

  it("should respect maxRows parameter", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_multiple_columns",
      arguments: {
        filePath: fixturePath,
        filters: {
          Department: "Engineering",
        },
        maxRows: 1,
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      ID: "1",
      Name: "Alice",
      Department: "Engineering",
      Status: "Active",
    });
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_multiple_columns",
      arguments: {
        filePath: fixturePath,
        filters: {
          NonExistentColumn: "value",
        },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get rows");
    expect(content[0].text).toContain("does not exist");
  });
});