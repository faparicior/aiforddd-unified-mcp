import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("ListTools", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should list available tools", async () => {
    const response = await client.listTools();

    expect(response.tools).toBeDefined();
    expect(response.tools.length).toBe(34);
    
    const toolNames = response.tools.map(tool => tool.name);
    expect(toolNames).toContain("echo");
    expect(toolNames).toContain("parse_markdown_table");
    expect(toolNames).toContain("add_column");
    expect(toolNames).toContain("delete_column");
    expect(toolNames).toContain("count_markdown_table_rows");
    expect(toolNames).toContain("filter_and_count_rows");
    expect(toolNames).toContain("get_row");
    expect(toolNames).toContain("find_row");
    expect(toolNames).toContain("get_first_row_by_column");
    expect(toolNames).toContain("get_multiple_rows_by_column");
    expect(toolNames).toContain("get_multiple_rows_by_multiple_columns");
    expect(toolNames).toContain("update_row_by_match");
    expect(toolNames).toContain("update_row_by_column");
    expect(toolNames).toContain("empty_column");
    expect(toolNames).toContain("get_unique_column_values");
  });

  it("should have echo tool with correct schema", async () => {
    const response = await client.listTools();
    const echoTool = response.tools.find((tool) => tool.name === "echo");
    
    expect(echoTool).toBeDefined();
    expect(echoTool?.description).toBe("Echoes back the input text");
    expect(echoTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to echo back",
        },
      },
      required: ["message"],
    });
  });

  it("should have parse_markdown_table tool with correct schema", async () => {
    const response = await client.listTools();
    const parseTableTool = response.tools.find((tool) => tool.name === "parse_markdown_table");
    
    expect(parseTableTool).toBeDefined();
    expect(parseTableTool?.description).toBe("Parse a markdown table from a file and convert it to JSON");
    expect(parseTableTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
      },
      required: ["filePath"],
    });
  });

  it("should have count_markdown_table_rows tool with correct schema", async () => {
    const response = await client.listTools();
    const countRowsTool = response.tools.find((tool) => tool.name === "count_markdown_table_rows");
    
    expect(countRowsTool).toBeDefined();
    expect(countRowsTool?.description).toBe("Count the number of rows in a markdown table");
    expect(countRowsTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
      },
      required: ["filePath"],
    });
  });

  it("should have filter_and_count_rows tool with correct schema", async () => {
    const response = await client.listTools();
    const filterCountTool = response.tools.find((tool) => tool.name === "filter_and_count_rows");
    
    expect(filterCountTool).toBeDefined();
    expect(filterCountTool?.description).toBe("Filter markdown table rows by column value and return the count");
    expect(filterCountTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
        columnName: {
          type: "string",
          description: "Name of the column to filter by",
        },
        value: {
          type: "string",
          description: "Value to match in the column",
        },
      },
      required: ["filePath", "columnName", "value"],
    });
  });

  it("should have get_row tool with correct schema", async () => {
    const response = await client.listTools();
    const getRowTool = response.tools.find((tool) => tool.name === "get_row");
    
    expect(getRowTool).toBeDefined();
    expect(getRowTool?.description).toBe("Get a specific row from a markdown table by index");
    expect(getRowTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
        rowIndex: {
          type: "number",
          description: "Zero-based index of the row to retrieve",
        },
      },
      required: ["filePath", "rowIndex"],
    });
  });

  it("should have find_row tool with correct schema", async () => {
    const response = await client.listTools();
    const findRowTool = response.tools.find((tool) => tool.name === "find_row");
    
    expect(findRowTool).toBeDefined();
    expect(findRowTool?.description).toBe("Find a specific row by column name and value (must be unique)");
    expect(findRowTool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
        columnName: {
          type: "string",
          description: "Name of the column to search by",
        },
        value: {
          type: "string",
          description: "Value to search for in the column",
        },
      },
      required: ["filePath", "columnName", "value"],
    });
  });

  it("should have get_unique_column_values tool with correct schema", async () => {
    const response = await client.listTools();
    const tool = response.tools.find((tool) => tool.name === "get_unique_column_values");
    
    expect(tool).toBeDefined();
    expect(tool?.description).toBe("Get the unique values of a column in a markdown table");
    expect(tool?.inputSchema).toMatchObject({
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the markdown file containing the table",
        },
        columnName: {
          type: "string",
          description: "Name of the column to get unique values from",
        },
      },
      required: ["filePath", "columnName"],
    });
  });
});
