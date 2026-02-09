
export interface DependencyNode {
  filePath: string;
  dependencies: string[];
  unresolvedDependencies?: string[];
  depth: number;
}

export interface LanguageHandler {
  extensions: string[];
  
  /**
   * Extract dependencies (imports, usages) from the file content
   */
  extractDependencies(content: string, filePath: string): string[];

  /**
   * Resolve a dependency string to an absolute file path
   */
  resolveDependency(dependency: string, baseDir: string): Promise<string | null>;

  /**
   * Check if the file represents an interface/abstraction definition
   */
  isInterfaceFile(filePath: string): Promise<boolean>;
}
