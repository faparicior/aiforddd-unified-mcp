import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { readFileSync, copyFileSync } from "fs";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Empty Column Tool", () => {
  let client: Client;
  const fixturePath = resolve(__dirname, "../../fixtures/update-table.md");
  const testFilePath = resolve(__dirname, "../../fixtures/empty-column-test.md");

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

  it("should empty all rows in a specific column", async () => {
    const response = await client.callTool({
      name: "empty_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Processed",
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
      rowsUpdated: 3,
      message: "Emptied 3 rows in column 'Processed'"
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check that all rows in the Processed column are now empty
    expect(lines[2]).toContain("| 1 | Alice | alice@example.com | Active |  |"); // Empty Processed column
    expect(lines[3]).toContain("| 2 | Bob | bob@example.com | Active |  |"); // Empty Processed column
    expect(lines[4]).toContain("| 3 | Charlie | charlie@example.com | Inactive |  |"); // Empty Processed column
  });

  it("should empty all rows in the Status column", async () => {
    const response = await client.callTool({
      name: "empty_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Status",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 3,
      message: "Emptied 3 rows in column 'Status'"
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check that all rows in the Status column are now empty
    expect(lines[2]).toContain("| 1 | Alice | alice@example.com |  | n |"); // Empty Status column
    expect(lines[3]).toContain("| 2 | Bob | bob@example.com |  | n |"); // Empty Status column
    expect(lines[4]).toContain("| 3 | Charlie | charlie@example.com |  | n |"); // Empty Status column
  });

  it("should throw error for non-existent column", async () => {
    const response = await client.callTool({
      name: "empty_column",
      arguments: {
        filePath: testFilePath,
        columnName: "NonExistentColumn",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Column 'NonExistentColumn' does not exist in the table");
  });

  it("should throw error for invalid file path", async () => {
    const response = await client.callTool({
      name: "empty_column",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "Processed",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Failed to empty column");
  });
});