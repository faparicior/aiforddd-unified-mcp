import { updateRowByMatch } from "../utils/parser.js";

export const updateRowByMatchTool = {
  name: "update_row_by_match",
  description:
    "Updates a row in a markdown table by matching a 'before' JSON object with the current row values and replacing it with an 'after' JSON object. The 'before' row must exist and be unique. Both 'before' and 'after' must have the same columns.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      before: {
        type: "object",
        description: "JSON object representing the current row values to find. Example: {'ID': '1', 'Name': 'Alice', 'Status': 'Active'}",
        additionalProperties: true,
      },
      after: {
        type: "object",
        description: "JSON object representing the new row values to replace with. Example: {'ID': '1', 'Name': 'Alice', 'Status': 'Inactive'}",
        additionalProperties: true,
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to update (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "before", "after"],
  },
};

export async function handleUpdateRowByMatch(args: any) {
  const { filePath, before, after, tableIndex = 0 } = args;

  try {
    const rowsUpdated = updateRowByMatch(filePath, before, after, tableIndex);
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
