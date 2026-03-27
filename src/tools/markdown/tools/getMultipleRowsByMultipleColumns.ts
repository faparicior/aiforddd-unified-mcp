import { getMultipleRowsByMultipleColumns } from "../utils/parser.js";

export const getMultipleRowsByMultipleColumnsTool = {
  name: "get_multiple_rows_by_multiple_columns",
  description:
    "Gets all rows that match multiple column values using AND logic. Returns an array of matching rows. Optionally limit the number of rows returned.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Path to the markdown file containing the table",
      },
      filters: {
        type: "object",
        description: "Object with column names as keys and values to match as values",
        additionalProperties: {
          type: "string",
        },
      },
      maxRows: {
        type: "number",
        description: "Optional maximum number of rows to return. If not specified, returns all matching rows.",
      },
      tableIndex: {
        type: "number",
        description: "Index of the table to search in (0-based, defaults to 0)",
        default: 0,
      },
      excludeFilters: {
        type: "object",
        description: "Optional object with column names as keys and values to exclude. Rows where any specified column matches the given value are removed from results (e.g. { \"Processed\": \"✓\" } to skip already-processed rows).",
        additionalProperties: {
          type: "string",
        },
      },
      selectColumns: {
        type: "array",
        description: "Optional list of column names to include in each returned row. If omitted, all columns are returned. Use this to reduce response size when only a few fields are needed (e.g. [\"Class name\", \"File\", \"Possible outsider\"]).",
        items: {
          type: "string",
        },
      },
    },
    required: ["filePath", "filters"],
  },
};

export async function handleGetMultipleRowsByMultipleColumns(args: any) {
  const { filePath, filters, maxRows, tableIndex = 0, excludeFilters, selectColumns } = args;

  try {
    const rows = getMultipleRowsByMultipleColumns(filePath, filters, maxRows, tableIndex, excludeFilters, selectColumns);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(rows, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get rows: ${error.message}`);
    }
    throw error;
  }
}