import { updateRowByColumn } from "../utils/parser.js";

export const updateRowByColumnTool = {
  name: "update_row_by_column",
  description:
    "Updates a row in a markdown table by finding it using a unique column identifier (column name and value). Updates only the specified columns with new values. The identifier value must be unique (only one row can match).",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to use as identifier to find the row",
      },
      columnValue: {
        type: "string",
        description: "Value to search for in the identifier column (must be unique)",
      },
      updates: {
        type: "object",
        description: "JSON object with column names as keys and new values to update. Example: {'Email': 'new@example.com', 'Status': 'Active'}",
        additionalProperties: true,
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to update (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName", "columnValue", "updates"],
  },
};

export async function handleUpdateRowByColumn(args: any) {
  const { filePath, columnName, columnValue, updates, tableIndex = 0 } = args;

  try {
    const rowsUpdated = updateRowByColumn(filePath, columnName, columnValue, updates, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true, rowsUpdated }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update row: ${error.message}`);
    }
    throw error;
  }
}
