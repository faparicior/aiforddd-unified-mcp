import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Filter and Count Rows Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should count rows where Processed is 'y' in simple table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
        value: "y",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("2");
  });

  it("should count rows where Processed is 'n' in simple table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
        value: "n",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("1");
  });

  it("should count rows where Stock is 'Yes' in aligned table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/aligned-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Stock",
        value: "Yes",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("2");
  });

  it("should return 0 when no rows match the filter", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
        value: "maybe",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("0");
  });

  it("should count rows with empty values", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Phone",
        value: "",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toBe("2");
  });

  it("should throw error for non-existent column", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "filter_and_count_rows",
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
    expect(content[0].text).toContain("Failed to filter and count rows");
    expect(content[0].text).toContain("does not exist");
  });

  it("should throw error for non-existent file", async () => {
    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: "/non/existent/file.md",
        columnName: "Processed",
        value: "y",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to filter and count rows");
    expect(content[0].text).toContain("no such file or directory");
  });

  it("should throw error for invalid markdown table", async () => {
    const fixturePath = resolve(__dirname, "testHelper.ts");

    const response = await client.callTool({
      name: "filter_and_count_rows",
      arguments: {
        filePath: fixturePath,
        columnName: "Processed",
        value: "y",
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to filter and count rows");
  });
});
