import { readFileSync, writeFileSync } from "fs";

export const updateStrategicClassificationTool = {
  name: "update_strategic_classification",
  description: "Update the strategic classification (domain type, business model, evolution stage) in a bounded context canvas markdown file",
};

export async function handleUpdateStrategicClassification(args: { filePath: string; domainType: string; businessModel: string; evolutionStage: string }) {
  try {
    let content = readFileSync(args.filePath, "utf-8");

    // Update the strategic classification table
    content = content.replace(
      /(\|\s*)([^|]+)(\s*\|\s*)([^|]+)(\s*\|\s*)([^|]+)(\s*\|)/,
      `$1${args.domainType}$3${args.businessModel}$5${args.evolutionStage}$7`
    );

    writeFileSync(args.filePath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated strategic classification to: Domain: ${args.domainType}, Business Model: ${args.businessModel}, Evolution: ${args.evolutionStage}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating strategic classification: ${error}`,
        },
      ],
    };
  }
}