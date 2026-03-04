import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodTypeAny, z } from "zod";

export interface ToolDefinition<T extends ZodTypeAny> {
    name: string;
    description: string;
    inputSchema: T;
    handler: (args: z.infer<T>, extra?: any) => Promise<any>;
}

export class ToolRegistry {
    private tools: Map<string, ToolDefinition<any>> = new Map();

    registerTool<T extends ZodTypeAny>(tool: ToolDefinition<T>): void {
        if (this.tools.has(tool.name)) {
            console.warn(`Tool ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }

    getTools(): ToolDefinition<any>[] {
        return Array.from(this.tools.values());
    }

    getTool(name: string): ToolDefinition<any> | undefined {
        return this.tools.get(name);
    }

    registerToMcpServer(server: McpServer): void {
        for (const tool of this.tools.values()) {
            server.registerTool(
                tool.name,
                {
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                },
                tool.handler
            );
        }
    }
}

// Global registry instance
export const globalToolRegistry = new ToolRegistry();
