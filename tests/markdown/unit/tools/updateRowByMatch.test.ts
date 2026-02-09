import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Update Row by Match Tool", () => {
  let client: Client;
  const fixturePath = resolve(__dirname, "../../fixtures/update-table.md");
  const testFilePath = resolve(__dirname, "../../fixtures/update-table-test.md");

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

  it("should update a row that matches the before JSON", async () => {
    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "2",
          Name: "Bob",
          Email: "bob@example.com",
          Status: "Active",
          Processed: "n",
        },
        after: {
          ID: "2",
          Name: "Bob",
          Email: "bob.new@example.com",
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
    expect(fileContent).toContain("bob.new@example.com");
    expect(fileContent).toContain("Inactive");
    expect(fileContent.match(/\| 2 \|/g)).toHaveLength(1); // Still only one row with ID 2
  });

  it("should update only specific columns while keeping others unchanged", async () => {
    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "1",
          Name: "Alice",
          Email: "alice@example.com",
          Status: "Active",
          Processed: "n",
        },
        after: {
          ID: "1",
          Name: "Alice",
          Email: "alice@example.com",
          Status: "Active",
          Processed: "y",
        },
      },
    });

    expect(response.content).toBeDefined();
    const content = response.content as Array<{ type: string; text: string }>;
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({ success: true, rowsUpdated: 1 });

    // Verify only Processed was changed
    const fileContent = readFileSync(testFilePath, "utf-8");
    const lines = fileContent.split("\n");
    const aliceRow = lines.find(line => line.includes("Alice"));
    expect(aliceRow).toContain("| 1 | Alice | alice@example.com | Active | y |");
  });

  it("should return error when before row does not exist", async () => {
    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "999",
          Name: "NonExistent",
          Email: "none@example.com",
          Status: "Active",
          Processed: "n",
        },
        after: {
          ID: "999",
          Name: "NonExistent",
          Email: "none@example.com",
          Status: "Inactive",
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

  it("should return error when multiple rows match the before JSON", async () => {
    // First, manually create a file with truly duplicate rows (same ID and all fields)
    const duplicateContent = `| ID | Name | Email | Status | Processed |
|----|------|-------|--------|-----------|
| 1 | Alice | alice@example.com | Active | n |
| 2 | Bob | bob@example.com | Active | n |
| 2 | Bob | bob@example.com | Active | n |
`;
    writeFileSync(testFilePath, duplicateContent);

    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "2",
          Name: "Bob",
          Email: "bob@example.com",
          Status: "Active",
          Processed: "n",
        },
        after: {
          ID: "2",
          Name: "Bob",
          Email: "bob.new@example.com",
          Status: "Active",
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

  it("should return error when before and after have different column sets", async () => {
    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "1",
          Name: "Alice",
        },
        after: {
          ID: "1",
          Name: "Alice",
          Email: "alice@example.com",
          Status: "Active",
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

  it("should return error for non-existent file", async () => {
    const response = await client.callTool({
      name: "update_row_by_match",
      arguments: {
        filePath: "/non/existent/file.md",
        before: { ID: "1", Name: "Test" },
        after: { ID: "1", Name: "Updated" },
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
      name: "update_row_by_match",
      arguments: {
        filePath: invalidPath,
        before: { ID: "1", Name: "Test" },
        after: { ID: "1", Name: "Updated" },
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
      name: "update_row_by_match",
      arguments: {
        filePath: testFilePath,
        before: {
          ID: "3",
          Name: "Charlie",
          Email: "charlie@example.com",
          Status: "Inactive",
          Processed: "n",
        },
        after: {
          ID: "3",
          Name: "Charlie Brown",
          Email: "cbrown@example.com",
          Status: "Active",
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
});
