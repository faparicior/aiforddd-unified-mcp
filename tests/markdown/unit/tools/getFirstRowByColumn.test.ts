import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Get First Row by Column Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should get the first row matching a column value", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "John",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      Name: "John",
      Age: "25",
      City: "NYC",
      Processed: "y",
    });
  });

  it("should get the first row when multiple rows match", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    // Should return the first Engineering row (Alice, ID 1)
    expect(result).toEqual({
      ID: "1",
      Name: "Alice",
      Department: "Engineering",
      Status: "Active",
    });
  });

  it("should get row with empty cell value", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Phone",
        value: "",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    
    // Should return the first row with empty Phone (ID 1)
    expect(result.ID).toBe("1");
    expect(result.Phone).toBe("");
  });

  it("should get row by Processed column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
        value: "y",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    
    // Should return first row with Processed = "y" (John)
    expect(result.Name).toBe("John");
    expect(result.Processed).toBe("y");
  });

  it("should throw error when no rows match", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "NonExistent",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
    expect(content[0].text).toContain("No row found");
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "NonExistentColumn",
        value: "something",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
    expect(content[0].text).toContain("does not exist");
  });

  it("should throw error for non-existent file", async () => {
    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "Name",
        value: "Jane",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
    expect(content[0].text).toContain("no such file or directory");
  });

  it("should throw error for invalid markdown table", async () => {
    const fixturePath = resolve(__dirname, "testHelper.ts");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "Jane",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
  });

  it("should get first row in a table with many matching rows", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "get_first_row_by_column",
      arguments: {
        filePath: fixturePath,
        columnName: "Status",
        value: "Active",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    
    // Should return the first Active row (Alice, ID 1)
    expect(result.ID).toBe("1");
    expect(result.Name).toBe("Alice");
    expect(result.Status).toBe("Active");
  });
});
