import * as path from 'path';
import { promises as fs, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { removeComments } from '../../utils/text.js';

export class TypeScriptHandler implements LanguageHandler {
  extensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const contentWithoutComments = removeComments(content);

    // Import statements
    // import ... from "module-name";
    const importFromPattern = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    
    // Side-effect imports
    // import "module-name";
    const importSideEffectPattern = /import\s+['"]([^'"]+)['"]/g;
    
    // Export statements
    // export ... from "module-name";
    const exportFromPattern = /export\s+.*?from\s+['"]([^'"]+)['"]/g;

    // Dynamic import / require
    // import("module-name")
    // require("module-name")
    const dynamicImportPattern = /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    const addMatches = (pattern: RegExp) => {
        let match;
        while ((match = pattern.exec(contentWithoutComments)) !== null) {
            dependencies.push(match[1]);
        }
    };

    addMatches(importFromPattern);
    addMatches(importSideEffectPattern);
    addMatches(exportFromPattern);
    addMatches(dynamicImportPattern);

    return [...new Set(dependencies)];
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
