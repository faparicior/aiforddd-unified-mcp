import { emptyColumn } from "../utils/parser.js";

export const emptyColumnTool = {
  name: "empty_column",
  description:
    "Empties all rows for a specific column in a markdown table by setting all values in that column to empty strings.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to empty",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to update (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName"],
  },
};

export async function handleEmptyColumn(args: any) {
  const { filePath, columnName, tableIndex = 0 } = args;

  try {
    const rowsUpdated = emptyColumn(filePath, columnName, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true, rowsUpdated, message: `Emptied ${rowsUpdated} rows in column '${columnName}'` }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to empty column: ${error.message}`);
    }
    throw error;
  }
}