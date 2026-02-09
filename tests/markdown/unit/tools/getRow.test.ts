import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { resolve } from "path";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Get Row Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should get the first row (index 0) from simple table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 0,
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

  it("should get the second row (index 1) from simple table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 1,
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

  it("should get the last row (index 2) from simple table", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 2,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    
    const result = JSON.parse(content[0].text);
    expect(result).toEqual({
      Name: "Bob",
      Age: "35",
      City: "Chicago",
      Processed: "y",
    });
  });

  it("should get a row with empty cells", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/empty-cells-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 1,
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

  it("should throw error for negative index", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: -1,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
    expect(content[0].text).toContain("must be non-negative");
  });

  it("should throw error for index out of bounds", async () => {
    const fixturePath = resolve(__dirname, "../../fixtures/simple-table.md");

    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 10,
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
    expect(content[0].text).toContain("Failed to get row");
    expect(content[0].text).toContain("out of bounds");
  });

  it("should throw error for non-existent file", async () => {
    const response = await client.callTool({
      name: "get_row",
      arguments: {
        filePath: "/non/existent/file.md",
        rowIndex: 0,
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
      name: "get_row",
      arguments: {
        filePath: fixturePath,
        rowIndex: 0,
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
});
