import { Engine } from 'php-parser';
import * as path from 'path';
import { promises as fs, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { findFileInDirectory, findProjectRoot, findFilesWithExtension } from '../../utils/fs-utils.js';

export class PhpHandler implements LanguageHandler {
  extensions = ['.php'];
  private parser: Engine;

  constructor() {
    this.parser = new Engine({
      parser: {
        extractDoc: false,
        suppressErrors: true,
      },
      ast: {
        withPositions: false,
      },
    });
  }

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    
    try {
      const ast: any = this.parser.parseCode(content, path.basename(filePath));

      // Quick AST recursive walk function
      const walkAst = (node: any) => {
        if (!node || typeof node !== 'object') return;

        // Extract "use" blocks (imports)
        if (node.kind === 'usegroup' && Array.isArray(node.items)) {
            for (const item of node.items) {
                if (item.kind === 'useitem' && item.name) {
                    dependencies.push(item.name);
                }
            }
        }

        // Extract "new \Fully\Qualified\ClassName()"
        if (node.kind === 'new' && node.what) {
          if (node.what.kind === 'name' && node.what.resolution === 'fqn') {
              let fqn = node.what.name;
              if (fqn.startsWith('\\')) fqn = fqn.substring(1);
              dependencies.push(fqn);
          }
        }

        // Traverse children
        for (const key of Object.keys(node)) {
           if (typeof node[key] === 'object') {
               walkAst(node[key]);
           }
        }
      };

      walkAst(ast);

    } catch (error) {
       console.error(`Error parsing PHP file ${filePath}:`, error);
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  async resolveDependency(dependency: string, baseDir: string): Promise<string | null> {
    // PHP mapping is tricky without composer autoload psr-4 map.
    // However, clean architecture projects usually follow Namespace -> Directory structure.
    
    // Convert Namespace\ClassName -> Namespace/ClassName.php
    const relPath = dependency.replace(/\\/g, path.sep) + '.php';
    
    const projectRoot = findProjectRoot(baseDir);
    
    // 1. Try to find the file from project root (assuming standard PSR-4 structure inside 'src')
    // Most common: App\Entity\User -> src/Entity/User.php (if App matches src)
    // Or: Domain\Model\User -> src/Domain/Model/User.php
    
    // We basically search for the File Name (last part) and check if the path ends with the namespace structure.
    const parts = dependency.split('\\');
    const className = parts[parts.length - 1];
    
    if (projectRoot) {
        // Find all files with that name in the project
        // This is "aggressive search" but effective when we don't parse composer.json
        const foundPath = await findFileInDirectory(projectRoot, `${className}.php`);
        
        // If we found a file, we could verify the namespace inside matches, but for now returned foundPath is good heuristic.
        // A more robust check would be: if resolved path ends with package path.
        if (foundPath) {
             return foundPath;
        }
    }

    return null;
  }

  async isInterfaceFile(filePath: string): Promise<boolean> {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const ast: any = this.parser.parseCode(content, path.basename(filePath));
        
        let foundInterface = false;

        const walkAst = (node: any) => {
            if (foundInterface) return;
            if (!node || typeof node !== 'object') return;
            if (node.kind === 'interface') {
                foundInterface = true;
                return;
            }
            for (const key of Object.keys(node)) {
                if (typeof node[key] === 'object') {
                    walkAst(node[key]);
                }
            }
        };

        walkAst(ast);
        return foundInterface;
      } catch {
          return false;
      }
  }

  async findImplementations(interfaceName: string, baseDir: string): Promise<string[]> {
      const implementations: string[] = [];
      
      try {
        const projectRoot = findProjectRoot(baseDir) || baseDir;
        const phpFiles = await findFilesWithExtension(projectRoot, '.php');

        for (const filePath of phpFiles) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const ast: any = this.parser.parseCode(content, path.basename(filePath));

                const walkAst = (node: any) => {
                    if (!node || typeof node !== 'object') return;
                    
                    if (node.kind === 'class' && Array.isArray(node.implements)) {
                        for (const impl of node.implements) {
                            if (impl.kind === 'name' && (impl.name === interfaceName || impl.name.endsWith('\\' + interfaceName))) {
                                implementations.push(filePath);
                            }
                        }
                    }

                    for (const key of Object.keys(node)) {
                        if (typeof node[key] === 'object') {
                            walkAst(node[key]);
                        }
                    }
                };

                walkAst(ast);
            } catch {
                // Skip files that fail to parse
            }
        }
      } catch {
        // Return empty on error finding files
      }

      return [...new Set(implementations)];
  }
}
