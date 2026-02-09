import { addColumn } from "../utils/parser.js";

export const addColumnTool = {
  name: "add_column",
  description:
    "Adds a new column to a markdown table at the specified position with the given column name.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the new column to add",
      },
      position: {
        type: "number",
        description: "Position to insert the column (0-based index)",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to update (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName", "position"],
  },
};

export async function handleAddColumn(args: any) {
  const { filePath, columnName, position, tableIndex = 0 } = args;

  try {
    const rowsUpdated = addColumn(filePath, columnName, position, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            rowsUpdated,
            message: `Added column '${columnName}' at position ${position}. Updated ${rowsUpdated} rows.`
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to add column: ${error.message}`);
    }
    throw error;
  }
}