import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { countMarkdownTableRows } from "../utils/parser.js";

export const countMarkdownTableRowsTool: Tool = {
  name: "count_markdown_table_rows",
  description: "Count the number of rows in a markdown table",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to count (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath"],
  },
};

export async function handleCountMarkdownTableRows(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const tableIndex = (args?.tableIndex as number) ?? 0;
    const count = countMarkdownTableRows(filePath, tableIndex);
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
    throw new Error(`Failed to count markdown table rows: ${errorMessage}`);
  }
}
