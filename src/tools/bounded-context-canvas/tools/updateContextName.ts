import { readFileSync, writeFileSync } from "fs";

export const updateContextNameTool = {
  name: "update_context_name",
  description: "Update the context name in a bounded context canvas markdown file",
};

export async function handleUpdateContextName(args: { filePath: string; newName: string }) {
  try {
    let content = readFileSync(args.filePath, "utf-8");

    // Update the name in the overview table
    content = content.replace(
      /(\|\s*\*\*Name\*\*\s*\|\s*)([^|]+)(\s*\|)/,
      `$1${args.newName}$3`
    );

    writeFileSync(args.filePath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated context name to "${args.newName}"`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating context name: ${error}`,
        },
      ],
    };
  }
}