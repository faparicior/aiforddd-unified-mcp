import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getUniqueColumnValues } from "../utils/parser.js";

export const getUniqueColumnValuesTool: Tool = {
  name: "get_unique_column_values",
  description: "Get the unique values of a column in a markdown table",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to get unique values from",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to read from (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName"],
  },
};

export async function handleGetUniqueColumnValues(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const columnName = args?.columnName as string;
    const tableIndex = (args?.tableIndex as number) ?? 0;
    const uniqueValues = getUniqueColumnValues(filePath, columnName, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(uniqueValues),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get unique column values: ${errorMessage}`);
  }
}