import { DependenciesMapperConfig, defaultConfig } from "./types.js";

/**
 * Configuration reader for the Dependencies Mapper MCP server
 */
export class ConfigReader {
  private config: DependenciesMapperConfig;

  constructor() {
    this.config = { ...defaultConfig };
  }

  /**
   * Get the current configuration
   */
  getConfig(): DependenciesMapperConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (placeholder for future implementation)
   */
  updateConfig(updates: Partial<DependenciesMapperConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}