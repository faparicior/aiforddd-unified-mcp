import * as path from 'path';
import { promises as fs, accessSync, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { removeComments } from '../../utils/text.js';
import { findFileInDirectory, findProjectRoot } from '../../utils/fs-utils.js';

export class JavaHandler implements LanguageHandler {
  extensions = ['.java'];

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const contentWithoutComments = removeComments(content);
    
    // Extract imports
    // import com.example.MyClass;
    const importPattern = /import\s+([\w.]+);/g;
    let match;
    while ((match = importPattern.exec(contentWithoutComments)) !== null) {
        dependencies.push(match[1]);
    }

    // Creating simplified Logic for Java:
    // Ideally we would parse classes used in the file, similar to Kotlin
    // For now we will focus on explicit imports as they are mandatory in Java for other packages
    // (Unlike Kotlin which can infer a lot or use star imports heavily)
    
    // We can also look for fully qualified names usage: com.example.MyClass match = ...
    const fqnPattern = /([a-zA-Z_$][a-zA-Z\d_$]*\.)+[a-zA-Z_$][a-zA-Z\d_$]*/g;
    // This is too noisy, let's stick to imports for now as the 80/20 rule.
    // However, if the user asks for "Java Support" equal to Kotlin, we might want to scan types used.
    // But Java requires importing types not in java.lang or same package.
    // So imports cover 90-99% of dependencies (except same-package dependencies).
    
    // To handle same-package dependencies:
    // We scan for capitalized words that look like classes.
    // If they are not imported, they might be in the same package.
    // We add them to "candidates" for same package resolution.
    
    const potentialClassUsage = /\b[A-Z][a-zA-Z0-9_]*\b/g;
    const importedSimpleNames = new Set(dependencies.map(d => d.split('.').pop()));
    
    const possibleSamePackageDeps = new Set<string>();
    while ((match = potentialClassUsage.exec(contentWithoutComments)) !== null) {
        const word = match[0];
        if (!this.isBuiltInType(word) && !importedSimpleNames.has(word)) {
            // It might be in the same package
            possibleSamePackageDeps.add(word);
        }
    }
    
    // To properly resolve same-package deps, we need to know the current package.
    const packageMatch = /package\s+([\w.]+);/.exec(contentWithoutComments);
    if (packageMatch) {
        const currentPackage = packageMatch[1];
        for (const dep of possibleSamePackageDeps) {
            dependencies.push(`${currentPackage}.${dep}`);
        }
    }

    return [...new Set(dependencies)];
  }

  async resolveDependency(dependency: string, baseDir: string): Promise<string | null> {
    if (this.isStandardLibrary(dependency)) return null;

    // Convert package to path
    const parts = dependency.split('.');
    const className = parts.pop();
    const packagePath = parts.join(path.sep); // com/example
    
    // Common source roots
    const sourceRoots = [
        'src/main/java',
        'src/test/java',
        'src/main/kotlin', // Mixed projects
        '.'
    ];
    
    const projectRoot = findProjectRoot(baseDir);
    
    for (const root of sourceRoots) {
        const fullRoot = path.resolve(projectRoot, root);
        const candidate = path.join(fullRoot, packagePath, `${className}.java`);
        
        try {
            await fs.access(candidate, constants.R_OK);
            return candidate;
        } catch {
            // continue
        }
    }

    // Try finding the file by name anywhere if package structure is non-standard
    if (projectRoot) {
       const found = await findFileInDirectory(projectRoot, `${className}.java`);
       if (found) return found;
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

  private isStandardLibrary(dep: string): boolean {
      return dep.startsWith('java.') || dep.startsWith('javax.') || dep.startsWith('sun.') || dep.startsWith('jdk.');
  }

  private isBuiltInType(name: string): boolean {
      return ['String', 'Integer', 'Boolean', 'Long', 'Double', 'Float', 'Byte', 'Short', 'Character', 'Object', 'Class', 'Void', 'List', 'Map', 'Set', 'Collection'].includes(name);
  }
}
