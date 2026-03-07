import Parser from 'tree-sitter';
import kotlinLanguage from 'tree-sitter-kotlin';
import * as path from 'path';
import { promises as fs, accessSync, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { findFileInDirectory, findProjectRoot, findFilesWithExtension } from '../../utils/fs-utils.js';

export class KotlinHandler implements LanguageHandler {
  extensions = ['.kt', '.kts'];
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(kotlinLanguage);
  }

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const currentFileName = path.basename(filePath, '.kt');
    
    try {
      const tree = this.parser.parse(content);
      const rootNode = tree.rootNode;

      // Extract explicit imports
      const importNodes = rootNode.descendantsOfType('import_header');
      const importedSimpleNames = new Set<string>();

      for (const node of importNodes) {
        const identifierNode = node.children.find(c => c.type === 'identifier');
        if (identifierNode) {
            const importPath = identifierNode.text;
            dependencies.push(importPath);
            importedSimpleNames.add(importPath.split('.').pop() || '');
        }
      }

      // Find all types used in the file
      const typeNodes = rootNode.descendantsOfType('user_type');
      for (const node of typeNodes) {
          const typeName = node.text;
          
          if (
              typeName !== currentFileName && 
              !this.isBuiltInType(typeName) && 
              !importedSimpleNames.has(typeName)
          ) {
              // Ensure it's not a generic container itself being pushed as part of a larger string
              // user_type nodes within tree-sitter-kotlin nicely fragment `<A, B>` into their own user_type nodes.
              const cleanTypeMatch = typeName.match(/^([A-Z]\w+)/);
              if (cleanTypeMatch && !this.isBuiltInType(cleanTypeMatch[1])) {
                  dependencies.push(cleanTypeMatch[1]);
              }
          }
      }

      // In Kotlin, a nested class extending a sealed class in the same file (e.g., `data class Success() : Result()`) 
      // creates a dependency on `Result`, but `Result` might be the top-level class (currentFileName).
      // If the inheritance references something that's *not* the current file name, we need it.
      // E.g., `sealed class Result : BaseResult` requires `BaseResult`.
      const delegationSpecifiers = rootNode.descendantsOfType('delegation_specifier');
      for (const node of delegationSpecifiers) {
          const userTypes = node.descendantsOfType('user_type');
          for (const ut of userTypes) {
              const text = ut.text.split('<')[0]; // Strip generics
              if (text !== currentFileName && !this.isBuiltInType(text) && !importedSimpleNames.has(text)) {
                 dependencies.push(text);
              }
          }
      }

      // Collect annotations usage
      const annotationNodes = rootNode.descendantsOfType('annotation');
      for (const node of annotationNodes) {
          // It usually starts with @ e.g., @Inject or @Service
          const cleanAnnotation = node.text.replace(/^@/, '').split('(')[0];
          if (
              cleanAnnotation !== currentFileName && 
              !this.isBuiltInType(cleanAnnotation)
          ) {
              dependencies.push(cleanAnnotation);
          }
      }

      // Collect object/method calls to support finding delegates and factories (e.g., UserFactory.create(), Delegates.observable)
      const callNodes = rootNode.descendantsOfType('call_expression');
      for (const call of callNodes) {
          // Some call expressions are `navigation_expression` children like `UserFactory . create()`
          // We can just scan all identifiers starting with a capital letter
          const identifiers = call.descendantsOfType('simple_identifier');
          for (const id of identifiers) {
              const text = id.text;
              if (/^[A-Z]\w+/.test(text) && !this.isBuiltInType(text) && !importedSimpleNames.has(text) && text !== currentFileName) {
                  dependencies.push(text);
              }
          }
      }

    } catch (error) {
       console.error(`Error parsing Kotlin file ${filePath}:`, error);
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  async resolveDependency(dependency: string, baseDir: string): Promise<string | null> {
    // Skip Kotlin and Java standard libraries
    if (this.isStandardLibrary(dependency)) {
      return null;
    }
  
    // Convert package notation to file path
    const pathParts = dependency.split('.');
    const fileName = pathParts[pathParts.length - 1];
    const packagePath = pathParts.slice(0, -1).join(path.sep);
  
    // Common source roots in Kotlin projects
    const sourceRoots = [
      '', // Current directory
      'src/main/kotlin',
      'src/main/java',
      'src/test/kotlin',
      'src/test/java',
      '../src/main/kotlin',
      '../src/main/java',
    ];
  
    const possibleExtensions = ['.kt', '.java'];
  
    // First try from the baseDir and common source roots
    for (const sourceRoot of sourceRoots) {
      for (const ext of possibleExtensions) {
        const possiblePaths = [
          // Full package path
          path.join(baseDir, sourceRoot, packagePath, `${fileName}${ext}`),
          // Direct in source root
          path.join(baseDir, sourceRoot, `${fileName}${ext}`),
          // Direct in base dir
          path.join(baseDir, `${fileName}${ext}`),
        ];
  
        for (const possiblePath of possiblePaths) {
          try {
            accessSync(possiblePath, constants.R_OK);
            return path.resolve(possiblePath);
          } catch {
            // File doesn't exist or not readable, continue
          }
        }
      }
    }
  
    // Walk up the directory tree to find package root
    let currentDir = baseDir;
    const maxLevelsUp = 10;
  
    for (let i = 0; i < maxLevelsUp; i++) {
      for (const ext of possibleExtensions) {
        const possiblePath = path.join(currentDir, packagePath, `${fileName}${ext}`);
        try {
          accessSync(possiblePath, constants.R_OK);
          return path.resolve(possiblePath);
        } catch {
          // Continue
        }
      }
  
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
    }
  
    // For simple class names (no package), search the entire project source trees
    if (!packagePath) {
      const projectRoot = findProjectRoot(baseDir);
      if (projectRoot && projectRoot !== '/' && projectRoot !== path.parse(projectRoot).root) {
        try {
          // Search recursively in common source directories
          const searchDirs = [
            path.join(projectRoot, 'src/main/java'),
            path.join(projectRoot, 'src/main/kotlin'),
            path.join(projectRoot, 'src/test/java'),
            path.join(projectRoot, 'src/test/kotlin'),
          ];
  
          for (const searchDir of searchDirs) {
            const foundPath = await findFileInDirectory(searchDir, `${fileName}.kt`) ||
                             await findFileInDirectory(searchDir, `${fileName}.java`);
            if (foundPath) {
              return foundPath;
            }
          }
        } catch (error) {
          // Continue to fallback
        }
      }
    }
  
    return null;
  }

  async isInterfaceFile(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const tree = this.parser.parse(content);
      for(let i=0; i < tree.rootNode.childCount; i++) {
          const child = tree.rootNode.child(i);
          if (child && child.type === 'class_declaration' && child.text.startsWith('interface')) {
              return true;
          }
      }
      return false;
    } catch (error) {
      console.error(`Error checking if file is interface: ${filePath}`, error);
      return false;
    }
  }

  async findImplementations(interfaceName: string, baseDir: string): Promise<string[]> {
    const implementations: string[] = [];
  
    // Strategy 1: Search in the provided baseDir
    const kotlinFiles = await findFilesWithExtension(baseDir, '.kt');
    implementations.push(...await this.findImplementationsInFiles(interfaceName, kotlinFiles));
  
    if (implementations.length > 0) {
      return implementations;
    }
  
    // Strategy 2: If no implementations found, search in parent directories
    let currentDir = path.resolve(baseDir);
    const maxParentLevels = 3;
  
    for (let i = 0; i < maxParentLevels; i++) {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; 
  
      try {
        const parentKotlinFiles = await findFilesWithExtension(parentDir, '.kt');
        const parentImplementations = await this.findImplementationsInFiles(interfaceName, parentKotlinFiles);
        implementations.push(...parentImplementations);
      } catch (error) {
        // Continue
      }
  
      currentDir = parentDir;
    }
  
    if (implementations.length > 0) {
      return implementations;
    }
  
    // Strategy 3: Try to find project root and search there
    const projectRoot = findProjectRoot(baseDir);
    if (projectRoot && projectRoot !== '/' && projectRoot !== path.parse(projectRoot).root && projectRoot !== baseDir) {
      try {
        const projectKotlinFiles = await findFilesWithExtension(projectRoot, '.kt');
        const projectImplementations = await this.findImplementationsInFiles(interfaceName, projectKotlinFiles);
        implementations.push(...projectImplementations);
      } catch (error) {
        // Continue
      }
    }
  
    return [...new Set(implementations)];
  }

  private async findImplementationsInFiles(interfaceName: string, kotlinFiles: string[]): Promise<string[]> {
    const implementations: string[] = [];
  
    for (const filePath of kotlinFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const tree = this.parser.parse(content);

        // Find class or object declarations
        const declarations = [
            ...tree.rootNode.descendantsOfType('class_declaration'),
            ...tree.rootNode.descendantsOfType('object_declaration')
        ];

        for (const decl of declarations) {
            const delegationNode = decl.descendantsOfType('delegation_specifier')[0];
            if (delegationNode) {
                const implementedTypes = delegationNode.descendantsOfType('user_type');
                if (implementedTypes.some(t => t.text === interfaceName)) {
                    implementations.push(filePath);
                    break;
                }
            }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }
  
    return implementations;
  }

  // Private helper methods
  
  private isBuiltInType(typeName: string): boolean {
    const builtInTypes = new Set([
      'String', 'Int', 'Long', 'Short', 'Byte', 'Double', 'Float', 'Boolean', 'Char',
      'List', 'Set', 'Map', 'Array', 'MutableList', 'MutableSet', 'MutableMap',
      'Sequence', 'Iterable', 'Collection', 'Unit', 'Any', 'Nothing',
      'Pair', 'Triple', 'Lazy'
    ]);
    if (builtInTypes.has(typeName)) return true;
    
    // Quick heuristic to discard clear non-class identifiers
    if (/^[a-z]/.test(typeName)) return true;
    
    return false;
  }

  private isStandardLibrary(dependency: string): boolean {
    const standardPrefixes = [
      'kotlin.',
      'kotlinx.',
      'java.',
      'javax.',
      'android.',
      'androidx.',
      'org.jetbrains.',
    ];
  
    return standardPrefixes.some(prefix => dependency.startsWith(prefix));
  }
}
