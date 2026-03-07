import Parser from 'tree-sitter';
import tsLanguage from 'tree-sitter-typescript';
import * as path from 'path';
import { promises as fs, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { removeComments } from '../../utils/text.js';

export class TypeScriptHandler implements LanguageHandler {
  extensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];
  private tsParser: Parser;
  private tsxParser: Parser;

  constructor() {
    this.tsParser = new Parser();
    this.tsParser.setLanguage(tsLanguage.typescript);

    this.tsxParser = new Parser();
    this.tsxParser.setLanguage(tsLanguage.tsx);
  }

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    
    // Choose appropriate parser based on file extension
    const isTsxOrJsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    const parser = isTsxOrJsx ? this.tsxParser : this.tsParser;

    try {
      const tree = parser.parse(content);
      this.visitNode(tree.rootNode, dependencies);
    } catch (error) {
      console.error(`Error parsing TypeScript/JavaScript file ${filePath}:`, error);
    }

    return [...new Set(dependencies)];
  }

  private visitNode(node: Parser.SyntaxNode, dependencies: string[]) {
    if (node.type === 'import_statement' || node.type === 'export_statement') {
      // Find the string literal within the import/export statement
      // For standard imports: import { X } from 'string'
      // For side-effect imports: import 'string'
      // For re-exports: export { X } from 'string'
      // For wildcard exports: export * from 'string'
      
      const sourceNodes = node.descendantsOfType('string');
      for (const sourceNode of sourceNodes) {
        // A string node usually has string_fragment children or is just text with quotes
        // Example: 'module-name' -> string_fragment = module-name
        const text = sourceNode.text.replace(/^['"]|['"]$/g, '');
        if (text) {
           // Ensure it's part of the actual source clause, usually marked by having an ancestor that is not just an import alias.
           // In most cases, finding the first string literal in an import/export statement is the module source.
           dependencies.push(text);
        }
      }
    } else if (node.type === 'call_expression') {
      // Look for require() or dynamic import()
      const functionNode = node.child(0);
      if (functionNode) {
        const isRequire = functionNode.type === 'identifier' && functionNode.text === 'require';
        const isImport = functionNode.type === 'import';

        if (isRequire || isImport) {
          const argumentsNode = node.childForFieldName('arguments') || node.children.find(c => c.type === 'arguments');
          if (argumentsNode) {
            const stringNodes = argumentsNode.descendantsOfType('string');
            for (const stringNode of stringNodes) {
              const text = stringNode.text.replace(/^['"]|['"]$/g, '');
              if (text) {
                dependencies.push(text);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
            this.visitNode(child, dependencies);
        }
    }
  }

  async resolveDependency(dependency: string, baseDir: string): Promise<string | null> {
    // Basic resolution for relative paths
    if (dependency.startsWith('.')) {
        const absolutePath = path.resolve(baseDir, dependency);
        
        // Try extensions
        const extensions = ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.json'];
        
        // 1. Exact match (file.ts) or file with extension added (file -> file.ts)
        // Check if absolutePath already has an extension
        if (path.extname(absolutePath) !== '') {
            if (await this.fileExists(absolutePath)) return absolutePath;
        }

        // Try adding extensions
        for (const ext of extensions) { 
             const tryPath = absolutePath + ext;
             if (await this.fileExists(tryPath)) return tryPath;
        }

        // 2. Directory index
        for (const ext of extensions) {
            const tryPath = path.join(absolutePath, 'index' + ext);
            if (await this.fileExists(tryPath)) return tryPath;
        }
    }

    // TODO: Handle tsconfig.json paths or node_modules if needed
    // For now, return null means "unresolved" (likely external or alias)
    return null;
  }

  async isInterfaceFile(filePath: string): Promise<boolean> {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const cleanCtx = removeComments(content);
        // Naive check for typescript interface export
        return /export\s+interface\s+\w+/.test(cleanCtx);
      } catch {
          return false;
      }
  }

  private async fileExists(path: string): Promise<boolean> {
      try {
          await fs.access(path, constants.R_OK);
          const stat = await fs.stat(path);
          return stat.isFile();
      } catch {
          return false;
      }
  }
}
