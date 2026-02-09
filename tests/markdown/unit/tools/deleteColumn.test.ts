import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { readFileSync, copyFileSync } from "fs";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Delete Column Tool", () => {
  let client: Client;
  const fixturePath = resolve(__dirname, "../../fixtures/update-table.md");
  const testFilePath = resolve(__dirname, "../../fixtures/delete-column-test.md");

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

  it("should delete the first column", async () => {
    const response = await client.callTool({
      name: "delete_column",
      arguments: {
        filePath: testFilePath,
        columnName: "ID",
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
      message: "Deleted column 'ID'. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| Name | Email | Status | Processed |");
    // Check separator
    expect(lines[1]).toBe("|------|-------|--------|-----------|");
    // Check data rows have the ID column removed
    expect(lines[2]).toBe("| Alice | alice@example.com | Active | n |");
    expect(lines[3]).toBe("| Bob | bob@example.com | Active | n |");
    expect(lines[4]).toBe("| Charlie | charlie@example.com | Inactive | n |");
  });

  it("should delete the last column", async () => {
    const response = await client.callTool({
      name: "delete_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Processed",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 5,
      message: "Deleted column 'Processed'. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| ID | Name | Email | Status |");
    // Check separator
    expect(lines[1]).toBe("|----|------|-------|--------|");
    // Check data rows have the Processed column removed
    expect(lines[2]).toBe("| 1 | Alice | alice@example.com | Active |");
    expect(lines[3]).toBe("| 2 | Bob | bob@example.com | Active |");
    expect(lines[4]).toBe("| 3 | Charlie | charlie@example.com | Inactive |");
  });

  it("should delete a middle column", async () => {
    const response = await client.callTool({
      name: "delete_column",
      arguments: {
        filePath: testFilePath,
        columnName: "Email",
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      success: true,
      rowsUpdated: 5,
      message: "Deleted column 'Email'. Updated 5 rows."
    });

    // Verify the file was actually updated
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");

    // Check header
    expect(lines[0]).toBe("| ID | Name | Status | Processed |");
    // Check separator
    expect(lines[1]).toBe("|----|------|--------|-----------|");
    // Check data rows have the Email column removed
    expect(lines[2]).toBe("| 1 | Alice | Active | n |");
    expect(lines[3]).toBe("| 2 | Bob | Active | n |");
    expect(lines[4]).toBe("| 3 | Charlie | Inactive | n |");
  });

  it("should throw error for non-existent column", async () => {
    const response = await client.callTool({
      name: "delete_column",
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
      name: "delete_column",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "ID",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Failed to delete column");
  });
});