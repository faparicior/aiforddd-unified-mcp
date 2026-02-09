import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { parseMarkdownTable } from "../utils/parser.js";

export const parseMarkdownTableTool: Tool = {
  name: "parse_markdown_table",
  description: "Parse a markdown table from a file and convert it to JSON",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to parse (0-based, defaults to 0)",
        default: 0,
      },
    },
    required: ["filePath"],
  },
};

export async function handleParseMarkdownTable(args: Record<string, unknown>) {
  try {
    const filePath = args?.filePath as string;
    const tableIndex = typeof args?.tableIndex === 'number' ? args.tableIndex : (typeof args?.tableIndex === 'string' ? parseInt(args.tableIndex) : 0);
    const table = parseMarkdownTable(filePath, tableIndex);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(table, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse markdown table: ${errorMessage}`);
  }
}
