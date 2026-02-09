import { deleteColumn } from "../utils/parser.js";

export const deleteColumnTool = {
  name: "delete_column",
  description:
    "Deletes a column from a markdown table by name.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to delete",
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

export async function handleDeleteColumn(args: any) {
  const { filePath, columnName, tableIndex = 0 } = args;

  try {
    const rowsUpdated = deleteColumn(filePath, columnName, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            rowsUpdated,
            message: `Deleted column '${columnName}'. Updated ${rowsUpdated} rows.`
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete column: ${error.message}`);
    }
    throw error;
  }
}