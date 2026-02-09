import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs, constants as fsConstants } from 'fs';
import * as path from 'path';
import { DependencyNode, LanguageHandler } from '../languages/LanguageHandler.js';
import { KotlinHandler } from '../languages/kotlin/KotlinHandler.js';
import { TypeScriptHandler } from '../languages/typescript/TypeScriptHandler.js';
import { JavaHandler } from '../languages/java/JavaHandler.js';
import { PhpHandler } from '../languages/php/PhpHandler.js';

export { DependencyNode };

export interface DependencyMap {
  rootFile: string;
  dependencyChain: DependencyNode[];
  totalFiles: number;
  maxDepth: number;
}

const handlers: LanguageHandler[] = [
  new KotlinHandler(),
  new TypeScriptHandler(),
  new JavaHandler(),
  new PhpHandler()
];

function getHandlerForFile(filePath: string): LanguageHandler | undefined {
  // Try to match by extension (case insensitive)
  const ext = path.extname(filePath).toLowerCase();
  
  // Find a handler that supports this extension
  // Using explicit property access if defined, otherwise casting check
  for (const handler of handlers) {
    if (handler.extensions.includes(ext)) {
      return handler;
    }
  }
  
  return undefined;
}

/**
 * Recursively maps dependencies for a file
 * Includes error handling, circular dependency detection, and performance optimization
 */
export async function mapDependencies(
  filePath: string,
  visited: Set<string> = new Set(),
  depth: number = 0,
  maxDepth: number = 10
): Promise<DependencyNode[]> {
  // Normalize path to handle relative paths and symlinks
  const normalizedPath = path.resolve(filePath);

  // Check termination conditions
  if (visited.has(normalizedPath)) {
    return []; // Circular dependency detected
  }

  if (depth > maxDepth) {
    console.warn(`Max depth ${maxDepth} reached for file: ${normalizedPath}`);
    return [];
  }

  const handler = getHandlerForFile(normalizedPath);
  if (!handler) {
    // If we don't have a handler (e.g. unknown language), we stop here
     return [{
      filePath: normalizedPath,
      dependencies: [],
      depth
    }];
  }

  visited.add(normalizedPath);

  try {
    // Verify file exists and is readable
    try {
      await fs.access(normalizedPath, fsConstants.R_OK);
    } catch (accessError) {
      throw new Error(`File not accessible: ${normalizedPath}`);
    }

    // Read file content
    const content = await fs.readFile(normalizedPath, 'utf-8');
    
    if (!content || content.trim().length === 0) {
      console.warn(`Empty file: ${normalizedPath}`);
      return [{
        filePath: normalizedPath,
        dependencies: [],
        depth
      }];
    }

    // Extract dependencies using the handler
    const dependencies = handler.extractDependencies(content, normalizedPath);

    const baseDir = path.dirname(normalizedPath);
    const resolvedDependencies: string[] = [];
    const unresolvedDependencies: string[] = [];
    const seenDeps = new Set<string>();
    const seenUnresolved = new Set<string>();

    // Resolve each dependency to file paths
    for (const dep of dependencies) {
      try {
        const resolvedPath = await handler.resolveDependency(dep, baseDir);
        if (resolvedPath) {
          const normalizedDepPath = path.resolve(resolvedPath);
          if (!seenDeps.has(normalizedDepPath) && normalizedDepPath !== normalizedPath) {
            seenDeps.add(normalizedDepPath);
            resolvedDependencies.push(normalizedDepPath);
          }
        } else {
          // Track unresolved dependencies
          if (!seenUnresolved.has(dep)) {
            seenUnresolved.add(dep);
            unresolvedDependencies.push(dep);
          }
        }
      } catch (resolveError) {
        if (!seenUnresolved.has(dep)) {
          seenUnresolved.add(dep);
          unresolvedDependencies.push(dep);
        }
      }
    }

    // For each resolved dependency that is an interface, also include its implementations
    const implementationDeps: string[] = [];
    // Check if handler supports finding implementations
    if ('findImplementations' in handler && typeof handler.findImplementations === 'function') {
        for (const depPath of resolvedDependencies) {
            // Check if dependency is handled by compatible handler
            const depHandler = getHandlerForFile(depPath);
            if (depHandler) {
                 if (await depHandler.isInterfaceFile(depPath)) {
                    // Extract the interface name from the file
                    const interfaceName = path.basename(depPath, path.extname(depPath));
                    const baseDirForSearch = path.dirname(normalizedPath); 
                    
                    try {
                        const implementations = await handler.findImplementations!(interfaceName, baseDirForSearch);
                        for (const implPath of implementations) {
                           const normalizedImplPath = path.resolve(implPath);
                           if (!seenDeps.has(normalizedImplPath) && normalizedImplPath !== normalizedPath) {
                               seenDeps.add(normalizedImplPath);
                               implementationDeps.push(normalizedImplPath);
                           }
                        }
                    } catch (error) {
                      console.error(`Error finding implementations for interface ${interfaceName}:`, error);
                    }
                  }
            }
        }
    }

    // Add implementation dependencies to resolved dependencies
    resolvedDependencies.push(...implementationDeps);

    // Filter out unresolved dependencies that are actually interfaces with found implementations
    const filteredUnresolvedDependencies = unresolvedDependencies.filter(dep => {
      const implementations = implementationDeps.filter(implPath =>
        path.basename(implPath, path.extname(implPath)) === dep || // strict name match
        path.basename(implPath, path.extname(implPath)).endsWith(dep) // loose match
      );
      return implementations.length === 0;
    });

    const currentNode: DependencyNode = {
      filePath: normalizedPath,
      dependencies: resolvedDependencies,
      unresolvedDependencies: filteredUnresolvedDependencies.length > 0 ? filteredUnresolvedDependencies : undefined,
      depth
    };

    const dependencyNodes: DependencyNode[] = [currentNode];

    // Recursively process dependencies
    for (const depPath of resolvedDependencies) {
      try {
        const childNodes = await mapDependencies(depPath, visited, depth + 1, maxDepth);
        dependencyNodes.push(...childNodes);
      } catch (childError) {
        console.error(`Error processing dependency ${depPath}:`, childError instanceof Error ? childError.message : String(childError));
      }
    }

    return dependencyNodes;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error processing file ${normalizedPath}:`, errorMessage);
    
    return [{
      filePath: normalizedPath,
      dependencies: [],
      depth
    }];
  }
}

// --- Backward Compatibility Wrappers for Tests ---

export function extractDependenciesFromKotlin(content: string, filePath: string): string[] {
    return new KotlinHandler().extractDependencies(content, filePath);
}

export async function resolveDependencyToFilePath(dependency: string, baseDir: string): Promise<string | null> {
    return new KotlinHandler().resolveDependency(dependency, baseDir);
}

export async function isInterfaceFile(filePath: string): Promise<boolean> {
    return new KotlinHandler().isInterfaceFile(filePath);
}

export async function findImplementationsOfInterface(interfaceName: string, baseDir: string): Promise<string[]> {
    const handler = new KotlinHandler();
    if (handler.findImplementations) {
        return handler.findImplementations(interfaceName, baseDir);
    }
    return [];
}

// ------------------------------------------------

/**
 * Register all dependency mapping tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  server.registerTool("map_dependencies", {
    description: "Reads a source code file (Kotlin, Java, TypeScript, PHP) and maps all its dependencies by following the dependency chain recursively",
    inputSchema: z.object({
      filePath: z.string().describe("Absolute path to the file to analyze. The tool detects language by extension."),
      maxDepth: z.number().optional().describe("Maximum depth to follow dependencies (default: 10)")
    })
  }, async (args) => {
    try {
      const normalizedPath = path.resolve(process.cwd(), args.filePath);
      
      try {
        await fs.access(normalizedPath, fsConstants.R_OK);
      } catch (accessError) {
        // Return structured error
        const errorOutput = {
          rootFile: normalizedPath,
          summary: { error: `File not found or not accessible: ${normalizedPath}` },
          dependencyChain: []
        };
        return {
          content: [{ type: "text", text: `\`\`\`json\n${JSON.stringify(errorOutput, null, 2)}\n\`\`\`` }]
        };
      }

      const maxDepth = args.maxDepth || 10;
      const dependencyNodes = await mapDependencies(normalizedPath, new Set(), 0, maxDepth);
      
      // ... reuse formatting logic ...
      const dependencyMap: DependencyMap = {
        rootFile: normalizedPath,
        dependencyChain: dependencyNodes,
        totalFiles: dependencyNodes.length,
        maxDepth: dependencyNodes.length > 0 ? Math.max(...dependencyNodes.map(node => node.depth)) : 0
      };

      const jsonOutput = {
        rootFile: dependencyMap.rootFile,
        language: path.extname(normalizedPath),
        summary: {
          totalFiles: dependencyMap.totalFiles,
          maxDepth: dependencyMap.maxDepth
        },
        dependencyChain: dependencyNodes.map(node => ({
          file: path.basename(node.filePath),
          fullPath: node.filePath,
          depth: node.depth,
          dependencies: node.dependencies.map(dep => path.basename(dep)),
          unresolvedDependencies: node.unresolvedDependencies || []
        }))
      };

      let textOutput = `## Dependency Analysis for ${path.basename(args.filePath)}\n\n`;
      textOutput += `**Summary:**\n`;
      textOutput += `- Language: ${path.extname(normalizedPath)}\n`;
      textOutput += `- Total files in dependency chain: ${dependencyMap.totalFiles}\n`;
      textOutput += `- Maximum dependency depth: ${dependencyMap.maxDepth}\n\n`;

      textOutput += `**Dependency Chain:**\n`;
      const sortedNodes = dependencyNodes.sort((a, b) => a.depth - b.depth);

      for (const node of sortedNodes) {
        const indent = "  ".repeat(node.depth);
        textOutput += `${indent}- ${path.basename(node.filePath)} (depth: ${node.depth})\n`;
        if (node.dependencies.length > 0) {
          textOutput += `${indent}  └─ Resolved: ${node.dependencies.map(dep => path.basename(dep)).join(", ")}\n`;
        }
        if (node.unresolvedDependencies && node.unresolvedDependencies.length > 0) {
          textOutput += `${indent}  └─ Unresolved: ${node.unresolvedDependencies.join(", ")}\n`;
        }
      }

      return {
        content: [
          { type: "text", text: `\`\`\`json\n${JSON.stringify(jsonOutput, null, 2)}\n\`\`\`` },
          { type: "text", text: textOutput }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to map dependencies: ${message}`);
    }
  });

  server.registerTool("find_interface_implementations", {
    description: "Finds all Kotlin classes that implement a given interface in the specified directory",
    inputSchema: z.object({
      interfaceName: z.string().describe("The name of the interface to find implementations for"),
      baseDir: z.string().describe("The base directory to search for Kotlin files")
    })
  }, async (args) => {
    try {
      const implementations = await findImplementationsOfInterface(args.interfaceName, args.baseDir);

      const jsonOutput = {
        interfaceName: args.interfaceName,
        baseDir: args.baseDir,
        implementations: implementations.map(impl => ({
          file: path.basename(impl),
          fullPath: impl
        })),
        totalImplementations: implementations.length
      };

      // Also provide human-readable text
      let textOutput = `## Implementations of ${args.interfaceName}\n\n`;
      textOutput += `**Summary:**\n`;
      textOutput += `- Total implementations found: ${implementations.length}\n\n`;

      if (implementations.length > 0) {
        textOutput += `**Implementation Files:**\n`;
        for (const impl of implementations) {
          textOutput += `- ${path.basename(impl)} (${impl})\n`;
        }
      } else {
        textOutput += `No implementations found for interface ${args.interfaceName}.\n`;
      }
      
      return {
        content: [
          { type: "text", text: `\`\`\`json\n${JSON.stringify(jsonOutput, null, 2)}\n\`\`\`` }
        ]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find interface implementations: ${message}`);
    }
  });
}
