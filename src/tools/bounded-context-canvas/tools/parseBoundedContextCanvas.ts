import { readFileSync } from "fs";
import { join } from "path";

export const parseBoundedContextCanvasTool = {
  name: "parse_bounded_context_canvas",
  description: "Parse a bounded context canvas markdown file and return structured data",
};

export async function handleParseBoundedContextCanvas(args: { filePath: string }) {
  try {
    const content = readFileSync(args.filePath, "utf-8");

    // Parse the canvas structure
    const canvas = {
      name: extractContextName(content),
      purpose: extractContextPurpose(content),
      strategicClassification: extractStrategicClassification(content),
      domainRoles: extractDomainRoles(content),
      rawContent: content,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(canvas, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error parsing bounded context canvas: ${error}`,
        },
      ],
    };
  }
}

function extractContextName(content: string): string {
  const nameMatch = content.match(/\|\s*\*\*Name\*\*\s*\|\s*([^|]+)\s*\|/);
  return nameMatch ? nameMatch[1].trim() : "";
}

function extractContextPurpose(content: string): string {
  const purposeMatch = content.match(/\|\s*\*\*Purpose\*\*\s*\|\s*([^|]+)\s*\|/);
  return purposeMatch ? purposeMatch[1].trim() : "";
}

function extractStrategicClassification(content: string): { domainType: string; businessModel: string; evolutionStage: string } {
  // Look for the strategic classification table data row (not the header or separator)
  const lines = content.split('\n');
  let inStrategicSection = false;

  for (const line of lines) {
    if (line.includes('## 🧩 Strategic Classification')) {
      inStrategicSection = true;
      continue;
    }

    if (inStrategicSection && line.includes('|---|---|---|')) {
      // Found the separator, next line should be data
      continue;
    }

    if (inStrategicSection && line.trim().startsWith('|') && !line.includes('Domain') && !line.includes('Business Model') && !line.includes('Evolution') && !line.includes('---')) {
      // This should be the data row (not header, not separator)
      const match = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
      if (match) {
        return {
          domainType: match[1].trim(),
          businessModel: match[2].trim(),
          evolutionStage: match[3].trim(),
        };
      }
    }

    if (inStrategicSection && line.startsWith('##') && !line.includes('## 🧩 Strategic Classification')) {
      // Moved to next section
      break;
    }
  }

  return { domainType: "", businessModel: "", evolutionStage: "" };
}

function extractDomainRoles(content: string): string[] {
  const lines = content.split('\n');
  let inDomainRolesSection = false;
  const roles: string[] = [];

  for (const line of lines) {
    if (line.includes('## 👥 Domain Roles')) {
      inDomainRolesSection = true;
      continue;
    }

    if (inDomainRolesSection && line.includes('|-------------|')) {
      // Found the separator, next lines should be data
      continue;
    }

    if (inDomainRolesSection && line.trim().startsWith('|') && !line.includes('Role Types')) {
      // This should be a data row
      const match = line.match(/\|\s*([^|]+)\s*\|/);
      if (match) {
        const role = match[1].trim();
        if (role && role !== '{{role_1}}' && role !== '{{role_2}}' && role !== '{{role_n}}') {
          roles.push(role);
        }
      }
    }

    if (inDomainRolesSection && line.startsWith('##') && !line.includes('## 👥 Domain Roles')) {
      // Moved to next section
      break;
    }
  }

  return roles;
}