import { readFileSync } from 'fs'
import Ajv from 'ajv'
import { ApplicationConfig } from './types.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

/**
 * Reads and parses the configuration file
 * @param configPath Path to the configuration JSON file
 * @returns Parsed ApplicationConfig
 * @throws Error if the configuration file does not match the required schema
 */
export function readConfig(configPath: string): ApplicationConfig {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const schemaPath = join(__dirname, 'config.dddclassifier.json')
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))

  let fileContent: string
  let data: ApplicationConfig

  try {
    fileContent = readFileSync(configPath, 'utf-8')
  } catch (error) {
    console.error('Error reading config file:', error)
    throw new Error(`Failed to read configuration file: ${configPath}`)
  }

  try {
    data = JSON.parse(fileContent)
  } catch (error) {
    console.error('Error parsing config file JSON:', error)
    throw new Error(`Invalid JSON in configuration file: ${configPath}`)
  }

  // Validate against schema
  const ajv = new (Ajv as any)()
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (!valid) {
    console.error('Configuration validation errors:')
    validate.errors?.forEach(error => {
      console.error(`- ${error.instancePath}: ${error.message}`)
    })
    throw new Error('Configuration file does not match the required schema')
  }

  return data
}
