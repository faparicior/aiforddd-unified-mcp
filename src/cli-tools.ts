#!/usr/bin/env node

import { Command } from 'commander';
import { globalToolRegistry } from './shared/cli/registry.js';

// Import tool registers
import { registerTools as registerMarkdownTools } from "./tools/markdown/tools/index.js";
import { registerTools as registerReadFileTools } from "./tools/read-files/tools/index.js";
import { registerTools as registerDependencyMapperTools } from "./tools/dependency-mapper/tools/index.js";
import { registerTools as registerBoundedContextTools } from "./tools/bounded-context-canvas/tools/index.js";
import { registerTools as registerCodeManifestTools } from "./tools/code-manifest/register.js";

// Register all tools to the global registry
registerMarkdownTools();
registerReadFileTools();
registerDependencyMapperTools();
registerBoundedContextTools();
registerCodeManifestTools();

const program = new Command();
program
    .name('ddd-tool')
    .description('CLI to execute DDD Tools without an MCP server session')
    .version('1.0.0');

// Dynamically create commands for each registered tool
const tools = globalToolRegistry.getTools();

for (const tool of tools) {
    const cmd = program.command(tool.name)
        .description(tool.description || `Execute ${tool.name}`);

    // We can't easily auto-generate options from Zod without a specialized library,
    // but we can accept a JSON string containing the arguments, OR 
    // we can use commander's unknown options support.
    // The simplest and most robust approach for complex objects is to accept a single JSON string
    // argument or dynamically add basic string options if the schema is shallow.

    // To handle complex schemas reliably, we add a --args option that takes JSON.
    cmd.option('-a, --args <json>', 'JSON string containing the tool arguments');

    // Let's also try to extract fields from the Zod schema if it's an object
    // Zod objects have .shape
    let shape: any = null;

    // Simple check to detect if it's a ZodObject and extract options
    if (tool.inputSchema && typeof tool.inputSchema === 'object' && 'shape' in tool.inputSchema) {
        shape = (tool.inputSchema as any).shape;
        for (const [key, _val] of Object.entries(shape)) {
            cmd.option(`--${key} <value>`, `${key} argument`);
        }
    }

    cmd.action(async (options) => {
        try {
            let parsedArgs: any = {};

            // Merge from --args JSON
            if (options.args) {
                try {
                    Object.assign(parsedArgs, JSON.parse(options.args));
                } catch (e) {
                    console.error(`Invalid JSON provided for --args: ${options.args}`);
                    process.exit(1);
                }
            }

            // Merge from specific options
            if (shape) {
                for (const key of Object.keys(shape)) {
                    if (options[key] !== undefined) {
                        // Basic type conversion based on Zod type would be ideal, 
                        // but we'll try to let Zod handle it or parse basic primitives if obvious
                        parsedArgs[key] = options[key];
                    }
                }
            }

            // Automatically parse numbers and booleans if possible to avoid Zod schema validation errors
            // A quick and dirty heuristic for string parsing
            for (const [k, v] of Object.entries(parsedArgs)) {
                if (typeof v === 'string') {
                    if (v === 'true') parsedArgs[k] = true;
                    else if (v === 'false') parsedArgs[k] = false;
                    else if (!isNaN(Number(v)) && v.trim() !== '') parsedArgs[k] = Number(v);
                }
            }

            // Validate against the Zod schema
            const validArgs = tool.inputSchema.parse(parsedArgs);

            // Execute handler
            const result = await tool.handler(validArgs);

            // Print result as JSON
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);

        } catch (error: any) {
            console.error(`Error executing ${tool.name}:`);
            console.error(error.message || error);
            process.exit(1);
        }
    });
}

program.parse(process.argv);
