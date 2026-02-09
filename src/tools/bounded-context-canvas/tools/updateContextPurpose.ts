import { readFileSync, writeFileSync } from "fs";

export const updateContextPurposeTool = {
  name: "update_context_purpose",
  description: "Update the context purpose in a bounded context canvas markdown file",
};

export async function handleUpdateContextPurpose(args: { filePath: string; newPurpose: string }) {
  try {
    let content = readFileSync(args.filePath, "utf-8");

    // Update the purpose in the overview table
    content = content.replace(
      /(\|\s*\*\*Purpose\*\*\s*\|\s*)([^|]+)(\s*\|)/,
      `$1${args.newPurpose}$3`
    );

    writeFileSync(args.filePath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated context purpose to "${args.newPurpose}"`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating context purpose: ${error}`,
        },
      ],
    };
  }
}