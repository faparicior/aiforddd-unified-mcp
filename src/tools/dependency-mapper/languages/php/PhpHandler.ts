import * as path from 'path';
import { promises as fs, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { removeComments } from '../../utils/text.js';
import { findFileInDirectory, findProjectRoot } from '../../utils/fs-utils.js';

export class PhpHandler implements LanguageHandler {
  extensions = ['.php'];

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const contentWithoutComments = removeComments(content);

    // use Namespace\Class;
    // use Namespace\Class as Alias;
    const usePattern = /use\s+([\w\\]+)(?:\s+as\s+\w+)?;/g;

    let match;
    while ((match = usePattern.exec(contentWithoutComments)) !== null) {
        dependencies.push(match[1]); // Captures the full namespace
    }

    // Capture explicit FQN usage: new \Namespace\Class()
    // The \ is crucial.
    const fqnNewPattern = /new\s+\\([\w\\]+)/g;
    while ((match = fqnNewPattern.exec(contentWithoutComments)) !== null) {
        dependencies.push(match[1]);
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
        const clean = removeComments(content);
        return /\binterface\s+\w+/.test(clean);
      } catch {
          return false;
      }
  }
}
