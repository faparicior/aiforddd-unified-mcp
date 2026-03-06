import { readFileSync } from 'fs'
import Ajv from 'ajv'

/**
 * Reads, parses, and optionally validates a JSON configuration file.
 * @param configPath Path to the configuration JSON file.
 * @param schemaPath Optional path to a JSON schema file to validate against.
 * @returns Parsed configuration cast to type T.
 * @throws Error if the file cannot be read, parsed, or fails validation.
 */
export function readConfig<T>(configPath: string, schemaPath?: string): T {
    let fileContent: string
    let data: T

    try {
        fileContent = readFileSync(configPath, 'utf-8')
    } catch (error) {
        throw new Error(`Failed to read configuration file: ${configPath}`)
    }

    try {
        data = JSON.parse(fileContent)
    } catch (error) {
        console.error('Error parsing config file JSON:', error)
        throw new Error(`Invalid JSON in configuration file: ${configPath}`)
    }

    // Validate against schema if provided
    if (schemaPath) {
        let schemaContent: string
        try {
            schemaContent = readFileSync(schemaPath, 'utf-8')
        } catch (error) {
            console.error('Error reading schema file:', error)
            throw new Error(`Failed to read schema file: ${schemaPath}`)
        }

        let schema: object
        try {
            schema = JSON.parse(schemaContent)
        } catch (error) {
            console.error('Error parsing schema file JSON:', error)
            throw new Error(`Invalid JSON in schema file: ${schemaPath}`)
        }

        const ajv = new (Ajv as any)()
        const validate = ajv.compile(schema)
        const valid = validate(data)

        if (!valid) {
            console.error('Configuration validation errors:')
            validate.errors?.forEach((error: any) => {
                console.error(`- ${error.instancePath}: ${error.message}`)
            })
            throw new Error('Configuration file does not match the required schema')
        }
    }

    return data
}
