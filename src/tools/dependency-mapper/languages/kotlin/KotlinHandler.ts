import * as path from 'path';
import { promises as fs, accessSync, constants } from 'fs';
import { LanguageHandler } from '../LanguageHandler.js';
import { removeComments } from '../../utils/text.js';
import { findFileInDirectory, findProjectRoot, findFilesWithExtension } from '../../utils/fs-utils.js';

export class KotlinHandler implements LanguageHandler {
  extensions = ['.kt', '.kts'];

  extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const currentFileName = path.basename(filePath, '.kt');
    
    // Remove comments to avoid false positives
    const contentWithoutComments = removeComments(content);
    
    // First, collect all imports to track what simple names are already imported
    const imports: string[] = [];
    const lines = contentWithoutComments.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
  
      // Extract import statements
      if (trimmedLine.startsWith('import ')) {
        const importMatch = trimmedLine.match(/import\s+([^\s;]+)/);
        if (importMatch) {
          const importPath = importMatch[1];
          imports.push(importPath);
          dependencies.push(importPath);
        }
      }
    }
  
    // Create a set of simple names from imports for quick lookup
    const importedSimpleNames = new Set(imports.map(imp => {
      const parts = imp.split('.');
      return parts[parts.length - 1];
    }));
  
    // Process full content for multi-line patterns
    // Normalize whitespace: replace multiple spaces/newlines with single space for better matching
    const normalizedContent = contentWithoutComments.replace(/\s+/g, ' ');
  
    // Extract class/interface inheritance and implementation
    const inheritancePattern = /\b(?:class|interface|object|enum\s+class|data\s+class|sealed\s+class|sealed\s+interface)\s+\w+\s*(?:<[^>]+>)?\s*(?:\([^)]*\)\s*)?:\s*([^{]+)/g;
    let inheritanceMatch;
    while ((inheritanceMatch = inheritancePattern.exec(normalizedContent)) !== null) {
      const inheritancePart = inheritanceMatch[1].trim();
      this.extractTypesFromInheritance(inheritancePart, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract annotation types
    const annotationPattern = /@(\w+)(?:\([^)]*\))?/g;
    let annotationMatch;
    while ((annotationMatch = annotationPattern.exec(normalizedContent)) !== null) {
      const annotation = annotationMatch[1];
      if (annotation !== currentFileName) {
        dependencies.push(annotation);
      }
    }
  
    // Extract property types (use greedy match to capture complete type with nested generics, handles delegates)
    const propertyTypePattern = /(?:val|var)\s+\w+\s*:\s*([A-Z][\w<>,\s?]+)(?=\s*(?:by\s|[=,)]|$))/g;
    let propertyMatch;
    while ((propertyMatch = propertyTypePattern.exec(normalizedContent)) !== null) {
      const typeName = propertyMatch[1].trim();
      this.extractCompleteTypeDeclaration(typeName, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract function return types (handles multi-line and extension functions)
    const returnTypePattern = /fun\s+(?:<[^>]+>)?\s*(?:[A-Z]\w+\s*\.\s*)?\w+\s*(?:<[^>]+>)?\s*\([^)]*\)\s*:\s*([A-Z][\w<>,\s?]+?)(?:\s*[{=])/g;
    let returnMatch;
    while ((returnMatch = returnTypePattern.exec(normalizedContent)) !== null) {
      const returnType = returnMatch[1].trim();
      this.extractCompleteTypeDeclaration(returnType, dependencies, currentFileName, importedSimpleNames);
    }
    
    // Extract parameter types (handles multi-line parameter lists)
    // Use lookahead to avoid consuming comma, allowing multiple parameter capture
    const parameterTypePattern = /(?:val|var)?\s*\w+\s*:\s*([A-Z][\w<>,\s?]+?)(?=\s*[,)])/g;
    let paramMatch;
    while ((paramMatch = parameterTypePattern.exec(normalizedContent)) !== null) {
      const typeName = paramMatch[1].trim();
      this.extractCompleteTypeDeclaration(typeName, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract companion object and nested class references
    const nestedPattern = /\b(?:companion\s+object|object)\s*:\s*([^{]+)/g;
    let nestedMatch;
    while ((nestedMatch = nestedPattern.exec(normalizedContent)) !== null) {
      const nestedPart = nestedMatch[1].trim();
      this.extractTypesFromInheritance(nestedPart, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract extension function receiver types (e.g., fun User.toDto())
    const extensionPattern = /fun\s+([A-Z]\w+)\s*\.\s*\w+\s*\(/g;
    let extensionMatch;
    while ((extensionMatch = extensionPattern.exec(normalizedContent)) !== null) {
      const receiverType = extensionMatch[1];
      if (receiverType !== currentFileName && !this.isBuiltInType(receiverType)) {
        dependencies.push(receiverType);
      }
    }
  
    // Extract typealias declarations (e.g., typealias UserMap = Map<String, User>)
    const typealiasPattern = /typealias\s+\w+\s*=\s*([A-Z][\w<>,\s?]+?)(?:\s|$)/g;
    let typealiasMatch;
    while ((typealiasMatch = typealiasPattern.exec(normalizedContent)) !== null) {
      const typeAliasType = typealiasMatch[1].trim();
      this.extractCompleteTypeDeclaration(typeAliasType, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract function type parameters (e.g., (UserResult) -> Unit)
    const functionTypePattern = /\(\s*([A-Z][\w<>,\s?]+?)\s*\)\s*->/g;
    let functionTypeMatch;
    while ((functionTypeMatch = functionTypePattern.exec(normalizedContent)) !== null) {
      const paramType = functionTypeMatch[1].trim();
      this.extractCompleteTypeDeclaration(paramType, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract lambda return types (e.g., () -> UserFactory, (User) -> ProcessedUser)
    const lambdaReturnPattern = /\([^)]*\)\s*->\s*([A-Z][\w<>,\s?]+?)(?:\s*[=,;]|$)/g;
    let lambdaReturnMatch;
    while ((lambdaReturnMatch = lambdaReturnPattern.exec(normalizedContent)) !== null) {
      const returnType = lambdaReturnMatch[1].trim();
      this.extractCompleteTypeDeclaration(returnType, dependencies, currentFileName, importedSimpleNames);
    }
  
    // Extract property delegate types (e.g., by lazy { UserFactory.create() }, by Delegates.observable(...))
    const delegatePattern = /\bby\s+(?:lazy|Delegates\.\w+)\s*\{\s*([A-Z]\w+)\./g;
    let delegateMatch;
    while ((delegateMatch = delegatePattern.exec(normalizedContent)) !== null) {
      const delegateType = delegateMatch[1];
      if (delegateType !== currentFileName && !this.isBuiltInType(delegateType)) {
        dependencies.push(delegateType);
      }
    }
  
    // Extract Delegates import from delegate usage
    const delegatesPattern = /\bby\s+Delegates\./g;
    if (delegatesPattern.test(normalizedContent)) {
      dependencies.push("Delegates");
    }
  
    return [...new Set(dependencies)]; // Remove duplicates and return
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
      const contentWithoutComments = removeComments(content);
      const normalizedContent = contentWithoutComments.replace(/\s+/g, ' ');
      
      // Check for interface declaration
      const interfacePattern = /\binterface\s+\w+/;
      return interfacePattern.test(normalizedContent);
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
    if (projectRoot !== '/' && projectRoot !== path.parse(projectRoot).root && projectRoot !== baseDir) {
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
        const contentWithoutComments = removeComments(content);
  
        // Check if this file contains a class that implements the interface
        const normalizedContent = contentWithoutComments.replace(/\s+/g, ' ');
  
        // Look for class declarations that implement the interface
        const classPattern = /\bclass\s+\w+\s*(?:<[^>]+>)?\s*(?:\([^)]*\)\s*)?:\s*([^,{]+)/g;
        let classMatch;
        while ((classMatch = classPattern.exec(normalizedContent)) !== null) {
          const inheritancePart = classMatch[1].trim();
          if (this.implementsInterface(inheritancePart, interfaceName)) {
            implementations.push(filePath);
            break; // Only add once per file
          }
        }
  
        // Also check for object declarations
        const objectPattern = /\bobject\s+\w+\s*:\s*([^,{]+)/g;
        let objectMatch;
        while ((objectMatch = objectPattern.exec(normalizedContent)) !== null) {
          const inheritancePart = objectMatch[1].trim();
          if (this.implementsInterface(inheritancePart, interfaceName)) {
            implementations.push(filePath);
            break;
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }
  
    return implementations;
  }

  private implementsInterface(inheritancePart: string, interfaceName: string): boolean {
    const types = inheritancePart.split(',');
    for (const type of types) {
      const trimmed = type.trim();
      const typeMatch = trimmed.match(/^([A-Z]\w+)/);
      if (typeMatch && typeMatch[1] === interfaceName) {
        return true;
      }
    }
    return false;
  }

  // Private helper methods
  
  private isBuiltInType(typeName: string): boolean {
    const builtInTypes = new Set([
      'String', 'Int', 'Long', 'Short', 'Byte', 'Double', 'Float', 'Boolean', 'Char',
      'List', 'Set', 'Map', 'Array', 'MutableList', 'MutableSet', 'MutableMap',
      'Sequence', 'Iterable', 'Collection', 'Unit', 'Any', 'Nothing',
      'Pair', 'Triple', 'Result', 'Lazy'
    ]);
    return builtInTypes.has(typeName);
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

  private extractTypesFromInheritance(inheritancePart: string, dependencies: string[], currentFileName: string, importedSimpleNames: Set<string>): void {
    const types = inheritancePart.split(',');
    
    for (const type of types) {
      const trimmed = type.trim();
      
      const typeMatch = trimmed.match(/^([A-Z]\w+)/);
      if (typeMatch) {
        const typeName = typeMatch[1];
        if (typeName !== currentFileName && !importedSimpleNames.has(typeName)) {
          dependencies.push(typeName);
        }
      }
  
      const genericMatch = trimmed.match(/<(.+)>/);
      if (genericMatch) {
        this.extractTypesFromGenerics(genericMatch[1], dependencies, currentFileName, importedSimpleNames);
      }
    }
  }

  private extractCompleteTypeDeclaration(declaration: string, dependencies: string[], currentFileName: string, importedSimpleNames: Set<string>): void {
    const cleanDecl = declaration.replace(/\?/g, '').trim();
    
    const mainTypeMatch = cleanDecl.match(/^([A-Z]\w+)/);
    if (mainTypeMatch) {
      const mainType = mainTypeMatch[1];
      if (mainType !== currentFileName && !this.isBuiltInType(mainType) && !importedSimpleNames.has(mainType)) {
        dependencies.push(mainType);
      }
    }
  
    const genericContent = this.extractGenericContent(cleanDecl);
    if (genericContent) {
      this.extractAllTypesFromGenerics(genericContent, dependencies, currentFileName, importedSimpleNames);
    }
  }

  private extractGenericContent(declaration: string): string | null {
    const startIndex = declaration.indexOf('<');
    if (startIndex === -1) return null;
    
    let depth = 0;
    let endIndex = -1;
    
    for (let i = startIndex; i < declaration.length; i++) {
      if (declaration[i] === '<') depth++;
      else if (declaration[i] === '>') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }
    
    if (endIndex === -1) return null;
    return declaration.substring(startIndex + 1, endIndex);
  }

  private extractAllTypesFromGenerics(generics: string, dependencies: string[], currentFileName: string, importedSimpleNames: Set<string>): void {
    const types: string[] = [];
    let current = '';
    let depth = 0;
  
    for (const char of generics) {
      if (char === '<') {
        depth++;
        current += char;
      } else if (char === '>') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        types.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      types.push(current.trim());
    }
  
    for (const type of types) {
      this.extractCompleteTypeDeclaration(type, dependencies, currentFileName, importedSimpleNames);
    }
  }

  private extractTypesFromGenerics(generics: string, dependencies: string[], currentFileName: string, importedSimpleNames: Set<string>): void {
    const types: string[] = [];
    let current = '';
    let depth = 0;
  
    for (const char of generics) {
      if (char === '<') {
        depth++;
        current += char;
      } else if (char === '>') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        types.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      types.push(current.trim());
    }
  
    for (const type of types) {
      const typeMatch = type.match(/^([A-Z]\w+)/);
      if (typeMatch) {
        const typeName = typeMatch[1];
        if (typeName !== currentFileName && !this.isBuiltInType(typeName) && !importedSimpleNames.has(typeName)) {
          dependencies.push(typeName);
        }
      }
  
      const nestedGenericMatch = type.match(/<(.+)>/);
      if (nestedGenericMatch) {
        this.extractTypesFromGenerics(nestedGenericMatch[1], dependencies, currentFileName, importedSimpleNames);
      }
    }
  }
}
