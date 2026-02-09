import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseBoundedContextCanvasTool, handleParseBoundedContextCanvas } from "./parseBoundedContextCanvas.js";
import { updateContextNameTool, handleUpdateContextName } from "./updateContextName.js";
import { updateContextPurposeTool, handleUpdateContextPurpose } from "./updateContextPurpose.js";
import { updateStrategicClassificationTool, handleUpdateStrategicClassification } from "./updateStrategicClassification.js";
import { updateDomainRolesTool, handleUpdateDomainRoles } from "./updateDomainRoles.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer) {
  server.registerTool(parseBoundedContextCanvasTool.name, {
    description: parseBoundedContextCanvasTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleParseBoundedContextCanvas(args);
    return result;
  });

  server.registerTool(updateContextNameTool.name, {
    description: updateContextNameTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      newName: z.string().describe("New context name to set"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateContextName(args);
    return result;
  });

  server.registerTool(updateContextPurposeTool.name, {
    description: updateContextPurposeTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      newPurpose: z.string().describe("New context purpose to set"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateContextPurpose(args);
    return result;
  });

  server.registerTool(updateStrategicClassificationTool.name, {
    description: updateStrategicClassificationTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      domainType: z.string().describe("New domain type (Core, Supporting, Generic)"),
      businessModel: z.string().describe("New business model type"),
      evolutionStage: z.string().describe("New evolution stage"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateStrategicClassification(args);
    return result;
  });

  server.registerTool(updateDomainRolesTool.name, {
    description: updateDomainRolesTool.description,
    inputSchema: {
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      roles: z.array(z.string()).describe("Array of domain roles to set"),
    },
  }, async (args, extra): Promise<any> => {
    const result = await handleUpdateDomainRoles(args);
    return result;
  });
}