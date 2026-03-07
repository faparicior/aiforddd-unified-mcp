import Parser from 'tree-sitter';
import javaLanguage from 'tree-sitter-java';
import * as path from 'path';
import { promises as fs, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { findFileInDirectory, findProjectRoot, findFilesWithExtension } from '../../utils/fs-utils.js';

export class JavaHandler implements LanguageHandler {
  extensions = ['.java'];
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(javaLanguage);
  }

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    
    try {
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;

      // 1. Extract explicit imports
      const importNodes = rootNode.descendantsOfType('import_declaration');
      for (const node of importNodes) {
        // children: [import, scoped_identifier, ;]
        const identifierNode = node.children.find(c => c.type === 'scoped_identifier' || c.type === 'identifier');
        if (identifierNode) {
          dependencies.push(identifierNode.text);
        }
      }

      const importedSimpleNames = new Set(dependencies.map(d => d.split('.').pop()));
      const possibleSamePackageDeps = new Set<string>();

      // 2. Discover same-package dependencies via type identifiers, object creation, and method calls
      const typeNodes = rootNode.descendantsOfType('type_identifier');
      for (const node of typeNodes) {
          const typeName = node.text;
          if (!this.isBuiltInType(typeName) && !importedSimpleNames.has(typeName) && typeName !== path.basename(filePath, '.java')) {
              possibleSamePackageDeps.add(typeName);
          }
      }

      const methodCalls = rootNode.descendantsOfType('method_invocation');
      for (const call of methodCalls) {
          // If the method call has an object, e.g., Helper.doSomething()
          const objectNode = call.childForFieldName('object');
          if (objectNode && objectNode.type === 'identifier') {
             const typeName = objectNode.text;
             if (!this.isBuiltInType(typeName) && !importedSimpleNames.has(typeName) && typeName !== path.basename(filePath, '.java')) {
                // If the object starts with a capital letter, it's highly likely a static class call
                if (/^[A-Z]/.test(typeName)) {
                    possibleSamePackageDeps.add(typeName);
                }
             }
          }
      }

      // 3. Resolve current package to prefix same-package dependencies
      const packageNode = rootNode.descendantsOfType('package_declaration')[0];
      if (packageNode) {
        const identifierNode = packageNode.children.find(c => c.type === 'scoped_identifier' || c.type === 'identifier');
        if (identifierNode) {
          const currentPackage = identifierNode.text;
          for (const dep of possibleSamePackageDeps) {
              dependencies.push(`${currentPackage}.${dep}`);
          }
        }
      } else {
        // Default package
        for (const dep of possibleSamePackageDeps) {
            dependencies.push(dep);
        }
      }
    } catch (error) {
      console.error(`Error parsing Java file ${filePath}:`, error);
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
          const tree = this.parser.parse(content);
          
          // An interface file usually has a single root interface_declaration 
          // (or it's wrapped in a class, but we look for top-level interface)
          const interfaceNodes = tree.rootNode.descendantsOfType('interface_declaration');
          return interfaceNodes.length > 0;
      } catch {
          return false;
      }
  }

  async findImplementations(interfaceName: string, baseDir: string): Promise<string[]> {
    const implementations: string[] = [];
    
    try {
      const projectRoot = findProjectRoot(baseDir) || baseDir;
      const javaFiles = await findFilesWithExtension(projectRoot, '.java');

      for (const filePath of javaFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const tree = this.parser.parse(content);
          
          // Look for class_declaration nodes
          const classNodes = tree.rootNode.descendantsOfType('class_declaration');
          for (const node of classNodes) {
              const interfacesNode = node.children.find(c => c.type === 'super_interfaces');
              if (interfacesNode) {
                  // super_interfaces has children like type_list -> type_identifier
                  const typeList = interfacesNode.children.find(c => c.type === 'interface_type_list');
                  if (typeList) {
                      const implementedInterfaces = typeList.descendantsOfType('type_identifier');
                      for (const implName of implementedInterfaces) {
                          if (implName.text === interfaceName) {
                              implementations.push(filePath);
                              break;
                          }
                      }
                  }
              }
          }
        } catch (error) {
           // Skip files that fail to parse
        }
      }
    } catch {
      // Return empty if we fail to read root
    }

    return [...new Set(implementations)];
  }

  private isStandardLibrary(dep: string): boolean {
      return dep.startsWith('java.') || dep.startsWith('javax.') || dep.startsWith('sun.') || dep.startsWith('jdk.');
  }

  private isBuiltInType(name: string): boolean {
      return ['String', 'Integer', 'Boolean', 'Long', 'Double', 'Float', 'Byte', 'Short', 'Character', 'Object', 'Class', 'Void', 'List', 'Map', 'Set', 'Collection'].includes(name);
  }
}
