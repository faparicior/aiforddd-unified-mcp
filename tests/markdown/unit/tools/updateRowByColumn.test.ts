import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { readFileSync, copyFileSync, writeFileSync } from "fs";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Update Row by Column Tool", () => {
  let client: Client;
  const fixturePath = resolve(__dirname, "../../fixtures/update-table.md");
  const testFilePath = resolve(__dirname, "../../fixtures/update-table-test2.md");

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  beforeEach(() => {
    // Create a fresh copy of the fixture for each test
    copyFileSync(fixturePath, testFilePath);
  });

  it("should update a row using unique column identifier", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "2",
        updates: {
          Email: "bob.updated@example.com",
          Status: "Inactive",
          Processed: "y",
        },
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    expect(fileContent).toContain("bob.updated@example.com");
    expect(fileContent).toContain("Inactive");
  });

  it("should update only the specified columns", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Name",
        columnValue: "Alice",
        updates: {
          Processed: "y",
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    // Verify only Processed was changed, others remain the same
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");
    const aliceRow = lines.find(line => line.includes("Alice"));
    expect(aliceRow).toContain("| 1 | Alice | alice@example.com | Active | y |");
  });

  it("should update multiple columns at once", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "3",
        updates: {
          Name: "Charles",
          Email: "charles@example.com",
          Status: "Active",
          Processed: "y",
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    const fileContent = readFileSync(testFilePath, "utf-8");
    expect(fileContent).toContain("Charles");
    expect(fileContent).toContain("charles@example.com");
    expect(fileContent).not.toContain("Charlie");
  });

  it("should return error when column value is not unique", async () => {
    // Create a file with duplicate Status values
    const duplicateContent = `| ID | Name | Email | Status | Processed |
|----|------|-------|--------|-----------|
| 1 | Alice | alice@example.com | Active | n |
| 2 | Bob | bob@example.com | Active | n |
| 3 | Charlie | charlie@example.com | Active | n |
`;
    writeFileSync(testFilePath, duplicateContent);

    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Status",
        columnValue: "Active",
        updates: {
          Processed: "y",
        },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should return error when column value not found", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "999",
        updates: {
          Processed: "y",
        },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should return error when identifier column does not exist", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "NonExistentColumn",
        columnValue: "value",
        updates: {
          Processed: "y",
        },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should return error when update column does not exist", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "1",
        updates: {
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
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should return error for non-existent file", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "ID",
        columnValue: "1",
        updates: { Name: "Test" },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should return error for invalid markdown table", async () => {
    const invalidPath = resolve(__dirname, "testHelper.ts");

    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: invalidPath,
        columnName: "ID",
        columnValue: "1",
        updates: { Name: "Test" },
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to update row");
  });

  it("should preserve table formatting after update", async () => {
    await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "1",
        updates: {
          Name: "Alice Updated",
          Processed: "y",
        },
      },
    });

    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");
    
    // Check header is preserved
    expect(lines[0]).toBe("| ID | Name | Email | Status | Processed |");
    expect(lines[1]).toBe("|----|------|-------|--------|-----------|");
    
    // Check all rows are present
    expect(lines.filter(line => line.trim().startsWith("|") && !line.includes("---")).length).toBe(4); // header + 3 data rows
  });

  it("should handle empty string updates", async () => {
    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
        columnValue: "2",
        updates: {
          Email: "",
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");
    const bobRow = lines.find(line => line.includes("Bob"));
    expect(bobRow).toContain("|  |"); // Empty cell
  });

  it("should update a row in the second table of a multi-table file", async () => {
    const multiTablePath = resolve(__dirname, "../../fixtures/multi-table.md");

    const response = await client.callTool({
      name: "update_row_by_column",
      arguments: {
        filePath: multiTablePath,
        columnName: "Product",
        columnValue: "Banana",
        updates: {
          Price: "0.80",
          Stock: "Out",
        },
        tableIndex: 1,
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    // Verify the second table was updated but first table remains unchanged
    const fileContent = readFileSync(multiTablePath, "utf-8");
    expect(fileContent).toContain("| Banana | 0.80 | Out |");
    expect(fileContent).toContain("| John | 25 | NYC |"); // First table unchanged
  });
});
