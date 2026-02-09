import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { echoTool, handleEcho } from "./echo.js";
import { parseMarkdownTableTool, handleParseMarkdownTable } from "./parseMarkdownTable.js";
import { countMarkdownTableRowsTool, handleCountMarkdownTableRows } from "./countMarkdownTableRows.js";
import { filterAndCountRowsTool, handleFilterAndCountRows } from "./filterAndCountRows.js";
import { getRowTool, handleGetRow } from "./getRow.js";
import { findRowTool, handleFindRow } from "./findRow.js";
import { getFirstRowByColumnTool, handleGetFirstRowByColumn } from "./getFirstRowByColumn.js";
import { getMultipleRowsByColumnTool, handleGetMultipleRowsByColumn } from "./getMultipleRowsByColumn.js";
import { getMultipleRowsByMultipleColumnsTool, handleGetMultipleRowsByMultipleColumns } from "./getMultipleRowsByMultipleColumns.js";
import { updateRowByMatchTool, handleUpdateRowByMatch } from "./updateRowByMatch.js";
import { updateRowByColumnTool, handleUpdateRowByColumn } from "./updateRowByColumn.js";
import { emptyColumnTool, handleEmptyColumn } from "./emptyColumn.js";
import { getUniqueColumnValuesTool, handleGetUniqueColumnValues } from "./getUniqueColumnValues.js";
import { addColumnTool, handleAddColumn } from "./addColumn.js";
import { deleteColumnTool, handleDeleteColumn } from "./deleteColumn.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer) {
  server.registerTool(echoTool.name, {
    description: echoTool.description,
    inputSchema: {
      message: z.string().describe("The message to echo back"),
    },
  }, async (args, extra): Promise<any> => {
    const message = args.message;
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        } as const,
      ],
    };
  });

  server.registerTool(parseMarkdownTableTool.name, {
    description: parseMarkdownTableTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to parse (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleParseMarkdownTable(args);
    return result;
  });

  server.registerTool(countMarkdownTableRowsTool.name, {
    description: countMarkdownTableRowsTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to count (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleCountMarkdownTableRows(args);
    return result;
  });

  server.registerTool(filterAndCountRowsTool.name, {
    description: filterAndCountRowsTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to filter by"),
      value: z.string().describe("Value to match in the column"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to filter (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleFilterAndCountRows(args);
    return result;
  });

  server.registerTool(getRowTool.name, {
    description: getRowTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      rowIndex: z.number().describe("Zero-based index of the row to retrieve"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to read from (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleGetRow(args);
    return result;
  });

  server.registerTool(findRowTool.name, {
    description: findRowTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to search by"),
      value: z.string().describe("Value to search for in the column"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to search (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleFindRow(args);
    return result;
  });

  server.registerTool(getFirstRowByColumnTool.name, {
    description: getFirstRowByColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to search in"),
      value: z.string().describe("Value to search for in the column"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to search (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleGetFirstRowByColumn(args);
    return result;
  });

  server.registerTool(getMultipleRowsByColumnTool.name, {
    description: getMultipleRowsByColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to search in"),
      value: z.string().describe("Value to search for in the column"),
      maxRows: z.number().optional().describe("Maximum number of rows to return (optional)"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to search (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleGetMultipleRowsByColumn(args);
    return result;
  });

  server.registerTool(getMultipleRowsByMultipleColumnsTool.name, {
    description: getMultipleRowsByMultipleColumnsTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      filters: z.record(z.string(), z.string()).describe("Object with column names as keys and values to match as values"),
      maxRows: z.number().optional().describe("Maximum number of rows to return (optional)"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to search (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleGetMultipleRowsByMultipleColumns(args);
    return result;
  });

  server.registerTool(updateRowByMatchTool.name, {
    description: updateRowByMatchTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      before: z.record(z.string(), z.any()).describe("JSON object representing the current row values to find"),
      after: z.record(z.string(), z.any()).describe("JSON object representing the new row values to replace with"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to update (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateRowByMatch(args);
    return result;
  });

  server.registerTool(updateRowByColumnTool.name, {
    description: updateRowByColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to use as identifier to find the row"),
      columnValue: z.string().describe("Value to search for in the identifier column (must be unique)"),
      updates: z.record(z.string(), z.any()).describe("JSON object with column names as keys and new values to update"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to update (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateRowByColumn(args);
    return result;
  });

  server.registerTool(emptyColumnTool.name, {
    description: emptyColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to empty"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to update (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleEmptyColumn(args);
    return result;
  });

  server.registerTool(getUniqueColumnValuesTool.name, {
    description: getUniqueColumnValuesTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to get unique values from"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to read from (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleGetUniqueColumnValues(args);
    return result;
  });

  server.registerTool(addColumnTool.name, {
    description: addColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the new column to add"),
      position: z.number().describe("Position to insert the column (0-based index)"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to update (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleAddColumn(args);
    return result;
  });

  server.registerTool(deleteColumnTool.name, {
    description: deleteColumnTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the markdown file containing the table"),
      columnName: z.string().describe("Name of the column to delete"),
      tableIndex: z.number().optional().default(0).describe("Index of the table to update (0-based, defaults to 0)"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleDeleteColumn(args);
    return result;
  });
}
