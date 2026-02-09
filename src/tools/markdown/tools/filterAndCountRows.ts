import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { filterAndCountRows } from "../utils/parser.js";

export const filterAndCountRowsTool: Tool = {
  name: "filter_and_count_rows",
  description: "Filter markdown table rows by column value and return the count",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      columnName: {
        type: "string",
        description: "Name of the column to filter by",
      },
      value: {
        type: "string",
        description: "Value to match in the column",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to filter (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath", "columnName", "value"],
  },
};

export async function handleFilterAndCountRows(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const columnName = args?.columnName as string;
    const value = args?.value as string;
    const tableIndex = (args?.tableIndex as number) ?? 0;
    const count = filterAndCountRows(filePath, columnName, value, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: String(count),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to filter and count rows: ${errorMessage}`);
  }
}
