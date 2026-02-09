import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Find Row Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should find a row by unique Name value", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "find_row",
      arguments: {
        filePath: fixturePath,
        columnName: "Name",
        value: "Jane",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      Name: "Jane",
      Age: "30",
      City: "LA",
      Processed: "n",
    });
  });

  it("should find a row by unique ID value", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    const response = await client.callTool({
      name: "find_row",
      arguments: {
        filePath: fixturePath,
        columnName: "ID",
        value: "2",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      ID: "2",
      Name: "",
      Email: "bob@example.com",
      Phone: "555-1234",
      Processed: "n",
    });
  });

  it("should throw error when searching for empty cell value with duplicates", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    // Phone is empty in 2 rows (ID 1 and ID 3), so this should fail
    const response = await client.callTool({
      name: "find_row",
      arguments: {
        filePath: fixturePath,
        columnName: "Phone",
        value: "",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to find row");
    expect(content[0].text).toContain("Multiple rows found");
  });

  it("should throw error when multiple rows match (not unique)", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "find_row",
      arguments: {
        filePath: fixturePath,
        columnName: "Department",
        value: "Engineering",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to find row");
    expect(content[0].text).toContain("Multiple rows found");
  });

  it("should throw error when no rows match", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "find_row",
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
    expect(content[0].text).toContain("Failed to find row");
    expect(content[0].text).toContain("No row found");
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "find_row",
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
    expect(content[0].text).toContain("Failed to find row");
    expect(content[0].text).toContain("does not exist");
  });

  it("should throw error for non-existent file", async () => {
    const response = await client.callTool({
      name: "find_row",
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
    expect(content[0].text).toContain("Failed to find row");
    expect(content[0].text).toContain("no such file or directory");
  });

  it("should throw error for invalid markdown table", async () => {
    const fixturePath = resolve(__dirname, "testHelper.ts");

    const response = await client.callTool({
      name: "find_row",
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
    expect(content[0].text).toContain("Failed to find row");
  });

  it("should find row when Status is unique", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/duplicate-values-table.md");

    const response = await client.callTool({
      name: "find_row",
      arguments: {
        filePath: fixturePath,
        columnName: "Status",
        value: "Inactive",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      ID: "3",
      Name: "Charlie",
      Department: "Engineering",
      Status: "Inactive",
    });
  });
});
