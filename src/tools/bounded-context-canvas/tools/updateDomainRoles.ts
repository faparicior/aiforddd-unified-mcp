import { readFileSync, writeFileSync } from "fs";

export const updateDomainRolesTool = {
  name: "update_domain_roles",
  description: "Update the domain roles in a bounded context canvas markdown file",
};

export async function handleUpdateDomainRoles(args: { filePath: string; roles: string[] }) {
  try {
    let content = readFileSync(args.filePath, "utf-8");

    // Find the Domain Roles section
    const rolesSectionRegex = /(## 👥 Domain Roles[\s\S]*?\| Role Types \|\n\|-------------\|\n)([\s\S]*?)(\n---|$)/;
    const match = content.match(rolesSectionRegex);

    if (!match) {
      return {
        content: [
          {
            type: "text",
            text: "Could not find Domain Roles section in the canvas",
          },
        ],
      };
    }

    // Generate new roles table content
    const rolesTable = args.roles.map(role => `| ${role} |`).join('\n');

    // Replace the roles section
    const newRolesSection = `${match[1]}${rolesTable}${match[3]}`;
    content = content.replace(rolesSectionRegex, newRolesSection);

    writeFileSync(args.filePath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated domain roles to: ${args.roles.join(", ")}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating domain roles: ${error}`,
        },
      ],
    };
  }
}