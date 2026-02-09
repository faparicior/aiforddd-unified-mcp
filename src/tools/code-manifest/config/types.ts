/**
 * ApplicationConfig represents the main configuration structure
 */
export interface ApplicationConfig {
  version: string
  app_details: ApplicationDetails[]
  destination_folder: string
}

/**
 * ApplicationDetails represents configuration details for a specific analysis path
 */
export interface ApplicationDetails {
  path: string
  language: string
  mode: string
  alias: string
  type: string
}
