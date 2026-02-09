import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { readFileSync, copyFileSync } from "fs";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Add Column Tool", () => {
  let client: Client;
  const fixturePath = resolve(__dirname, "../../fixtures/update-table.md");
  const testFilePath = resolve(__dirname, "../../fixtures/add-column-test.md");

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

  it("should add a new column at position 0", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "NewColumn",
        position: 0,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");

    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 5, // header + separator + 3 data rows
      message: "Added column 'NewColumn' at position 0. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| NewColumn | ID | Name | Email | Status | Processed |");
    // Check separator
    expect(lines[1]).toBe("|---|----|------|-------|--------|-----------|");
    // Check data rows have empty first column
    expect(lines[2]).toBe("|  | 1 | Alice | alice@example.com | Active | n |");
    expect(lines[3]).toBe("|  | 2 | Bob | bob@example.com | Active | n |");
    expect(lines[4]).toBe("|  | 3 | Charlie | charlie@example.com | Inactive | n |");
  });

  it("should add a new column at position 2", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "MiddleColumn",
        position: 2,
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 5,
      message: "Added column 'MiddleColumn' at position 2. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| ID | Name | MiddleColumn | Email | Status | Processed |");
    // Check separator
    expect(lines[1]).toBe("|----|------|---|-------|--------|-----------|");
    // Check data rows have empty third column
    expect(lines[2]).toBe("| 1 | Alice |  | alice@example.com | Active | n |");
    expect(lines[3]).toBe("| 2 | Bob |  | bob@example.com | Active | n |");
    expect(lines[4]).toBe("| 3 | Charlie |  | charlie@example.com | Inactive | n |");
  });

  it("should add a new column at the end", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "LastColumn",
        position: 5, // After the last existing column
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 5,
      message: "Added column 'LastColumn' at position 5. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| ID | Name | Email | Status | Processed | LastColumn |");
    // Check separator
    expect(lines[1]).toBe("|----|------|-------|--------|-----------|---|");
    // Check data rows have empty last column
    expect(lines[2]).toBe("| 1 | Alice | alice@example.com | Active | n |  |");
    expect(lines[3]).toBe("| 2 | Bob | bob@example.com | Active | n |  |");
    expect(lines[4]).toBe("| 3 | Charlie | charlie@example.com | Inactive | n |  |");
  });

  it("should throw error for duplicate column name", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID", // Already exists
        position: 0,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Column 'ID' already exists in the table");
  });

  it("should throw error for invalid position", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "TestColumn",
        position: 10, // Beyond table bounds
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Position 10 is out of bounds");
  });

  it("should throw error for negative position", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: testFilePath,
        columnName: "TestColumn",
        position: -1,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Position -1 is out of bounds");
  });

  it("should throw error for invalid file path", async () => {
    const response = await client.callTool({
      name: "add_column",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "TestColumn",
        position: 0,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Failed to add column");
  });
});