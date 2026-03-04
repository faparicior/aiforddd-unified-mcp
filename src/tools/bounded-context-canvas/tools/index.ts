import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseBoundedContextCanvasTool, handleParseBoundedContextCanvas } from "./parseBoundedContextCanvas.js";
import { updateContextNameTool, handleUpdateContextName } from "./updateContextName.js";
import { updateContextPurposeTool, handleUpdateContextPurpose } from "./updateContextPurpose.js";
import { updateStrategicClassificationTool, handleUpdateStrategicClassification } from "./updateStrategicClassification.js";
import { updateDomainRolesTool, handleUpdateDomainRoles } from "./updateDomainRoles.js";
import { globalToolRegistry } from "../../../shared/cli/registry.js";

/**
 * Register all tools with the global tool registry
 */
export function registerTools() {
  globalToolRegistry.registerTool({
    name: parseBoundedContextCanvasTool.name,
    description: parseBoundedContextCanvasTool.description,
    inputSchema: z.object({
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
    }),
    handler: async (args, extra): Promise<any> => {
      const result = await handleParseBoundedContextCanvas(args as any);
      return result;
    }
  });

  globalToolRegistry.registerTool({
    name: updateContextNameTool.name,
    description: updateContextNameTool.description,
    inputSchema: z.object({
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      newName: z.string().describe("New context name to set"),
    }),
    handler: async (args, extra): Promise<any> => {
      const result = await handleUpdateContextName(args as any);
      return result;
    }
  });

  globalToolRegistry.registerTool({
    name: updateContextPurposeTool.name,
    description: updateContextPurposeTool.description,
    inputSchema: z.object({
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      newPurpose: z.string().describe("New context purpose to set"),
    }),
    handler: async (args, extra): Promise<any> => {
      const result = await handleUpdateContextPurpose(args as any);
      return result;
    }
  });

  globalToolRegistry.registerTool({
    name: updateStrategicClassificationTool.name,
    description: updateStrategicClassificationTool.description,
    inputSchema: z.object({
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      domainType: z.string().describe("New domain type (Core, Supporting, Generic)"),
      businessModel: z.string().describe("New business model type"),
      evolutionStage: z.string().describe("New evolution stage"),
    }),
    handler: async (args, extra): Promise<any> => {
      const result = await handleUpdateStrategicClassification(args as any);
      return result;
    }
  });

  globalToolRegistry.registerTool({
    name: updateDomainRolesTool.name,
    description: updateDomainRolesTool.description,
    inputSchema: z.object({
      filePath: z.string().describe("Path to the bounded context canvas markdown file"),
      roles: z.array(z.string()).describe("Array of domain roles to set"),
    }),
    handler: async (args, extra): Promise<any> => {
      const result = await handleUpdateDomainRoles(args as any);
      return result;
    }
  });
}