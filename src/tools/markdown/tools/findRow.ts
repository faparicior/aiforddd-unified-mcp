import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { findRow } from "../utils/parser.js";

export const findRowTool: Tool = {
  name: "find_row",
  description: "Find a specific row by column name and value (must be unique)",
  inputSchema: {
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
      tableIndex: {
        type: "number",
        description: "Index of the table to search in (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName", "value"],
  },
};

export async function handleFindRow(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const columnName = args?.columnName as string;
    const value = args?.value as string;
    const tableIndex = (args?.tableIndex as number) ?? 0;
    const row = findRow(filePath, columnName, value, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(row, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to find row: ${errorMessage}`);
  }
}
