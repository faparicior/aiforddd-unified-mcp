import { getMultipleRowsByColumn } from "../utils/parser.js";

export const getMultipleRowsByColumnTool = {
  name: "get_multiple_rows_by_column",
  description:
    "Gets all rows that match a specific column value. Returns an array of matching rows. Optionally limit the number of rows returned.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to search in",
      },
      value: {
        type: "string",
        description: "Value to search for in the column",
      },
      maxRows: {
        type: "number",
        description: "Optional maximum number of rows to return. If not specified, returns all matching rows.",
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

export async function handleGetMultipleRowsByColumn(args: any) {
  const { filePath, columnName, value, maxRows, tableIndex = 0 } = args;

  try {
    const rows = getMultipleRowsByColumn(filePath, columnName, value, maxRows, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(rows, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get rows: ${error.message}`);
    }
    throw error;
  }
}