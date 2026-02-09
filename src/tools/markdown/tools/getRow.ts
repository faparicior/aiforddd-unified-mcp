import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getRow } from "../utils/parser.js";

export const getRowTool: Tool = {
  name: "get_row",
  description: "Get a specific row from a markdown table by index",
  inputSchema: {
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
      tableIndex: {
        type: "number",
        description: "Index of the table to get row from (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "rowIndex"],
  },
};

export async function handleGetRow(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const rowIndex = args?.rowIndex as number;
    const tableIndex = (args?.tableIndex as number) ?? 0;
    const row = getRow(filePath, rowIndex, tableIndex);
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
    throw new Error(`Failed to get row: ${errorMessage}`);
  }
}
