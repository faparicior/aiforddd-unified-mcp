import { getFirstRowByColumn } from "../utils/parser.js";

export const getFirstRowByColumnTool = {
  name: "get_first_row_by_column",
  description:
    "Gets the first row that matches a specific column value. Unlike find_row, this does not require the value to be unique - it simply returns the first matching row found.",
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
      tableIndex: {
        type: "number",
        description: "Index of the table to search in (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName", "value"],
  },
};

export async function handleGetFirstRowByColumn(args: any) {
  const { filePath, columnName, value, tableIndex = 0 } = args;

  try {
    const row = getFirstRowByColumn(filePath, columnName, value, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(row, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get row: ${error.message}`);
    }
    throw error;
  }
}
