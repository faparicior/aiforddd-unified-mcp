import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Get Multiple Rows by Column Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should get all rows matching a column value", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
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

  it("should return empty array when no rows match", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "NonExistent",
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

  it("should get single row when only one matches", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "John",
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
      Name: "John",
      Age: "25",
      City: "NYC",
      Processed: "y",
    });
  });

  it("should limit rows when maxRows is specified", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
        maxRows: 1,
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1); // Should only return 1 row instead of 2
    expect(result[0]).toEqual({
      ID: "1",
      Name: "Alice",
      Department: "Engineering",
      Status: "Active",
    });
  });

  it("should return all rows when maxRows is larger than available rows", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
        maxRows: 10, // More than the 2 available rows
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2); // Should return all 2 rows
  });

  it("should return empty array when maxRows is 0", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
        maxRows: 0,
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0); // Should return empty array
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_multiple_rows_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "NonExistentColumn",
        value: "test",
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