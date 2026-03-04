import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readConfig } from '../../../src/shared/config/config-reader.ts'
import { createTempDir, removeTempDir, createTestFile, createTestConfig } from '../../code-manifest/fixtures/test-helpers.ts'
import { mockApplicationConfig } from '../../code-manifest/fixtures/mock-data.ts'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const schemaPath = join(__dirname, '../../../src/tools/code-manifest/config/config.dddclassifier.json')
describe('config-reader', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('config-reader-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('readConfig', () => {
    it('should read and parse valid config file', () => {
      const configContent = createTestConfig([
        {
          path: './src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'test-app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details).toHaveLength(1)
      expect(result.app_details[0].alias).toBe('test-app')
      expect(result.app_details[0].language).toBe('kotlin')
    })

    it('should parse multiple app details', () => {
      const configContent = createTestConfig([
        {
          path: './src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'app1',
          type: 'code'
        },
        {
          path: './src/test/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'app1',
          type: 'test'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details).toHaveLength(2)
      expect(result.app_details[0].type).toBe('code')
      expect(result.app_details[1].type).toBe('test')
    })

    it('should read all config fields correctly', () => {
      const configContent = createTestConfig([
        {
          path: '/project/src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'my-app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      const detail = result.app_details[0]
      expect(detail.path).toBe('/project/src/main/kotlin')
      expect(detail.language).toBe('kotlin')
      expect(detail.mode).toBe('class')
      expect(detail.alias).toBe('my-app')
      expect(detail.type).toBe('code')
    })

    it('should handle empty app_details array', () => {
      const configContent = JSON.stringify({ version: '1.0.0', app_details: [], destination_folder: './output' })
      const configPath = createTestFile(tempDir, 'config.json', configContent)

      const result = readConfig(configPath, schemaPath)

      expect(result.app_details).toHaveLength(0)
    })

    it('should throw error on invalid JSON', () => {
      const configPath = createTestFile(tempDir, 'config.json', 'invalid json {')

      expect(() => readConfig(configPath, schemaPath)).toThrow('Invalid JSON in configuration file')
    })

    it('should throw error on non-existent file', () => {
      const nonExistentPath = join(tempDir, 'does-not-exist.json')

      expect(() => readConfig(nonExistentPath, schemaPath)).toThrow('Failed to read configuration file')
    })

    it('should throw error when schema validation fails', () => {
      // Create a config missing the required destination_folder property
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './src/main/kotlin',
            language: 'kotlin',
            mode: 'class',
            alias: 'test-app',
            type: 'code'
          }
        ]
        // destination_folder is missing - this should fail schema validation
      })

      const configPath = createTestFile(tempDir, 'config.json', configContent)

      expect(() => readConfig(configPath, schemaPath)).toThrow('Configuration file does not match the required schema')
    })

    it('should handle config with different languages', () => {
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './src/kotlin',
            language: 'kotlin',
            mode: 'class',
            alias: 'app',
            type: 'code'
          },
          {
            path: './src/java',
            language: 'java',
            mode: 'class',
            alias: 'app',
            type: 'code'
          }
        ],
        destination_folder: './output'
      })

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details).toHaveLength(2)
      expect(result.app_details[0].language).toBe('kotlin')
      expect(result.app_details[1].language).toBe('java')
    })

    it('should handle config with different modes', () => {
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './src/main',
            language: 'kotlin',
            mode: 'class',
            alias: 'app',
            type: 'code'
          },
          {
            path: './src/test',
            language: 'kotlin',
            mode: 'file',
            alias: 'app',
            type: 'test'
          }
        ],
        destination_folder: './output'
      })

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details[0].mode).toBe('class')
      expect(result.app_details[1].mode).toBe('file')
    })

    it('should parse config with absolute paths', () => {
      const configContent = createTestConfig([
        {
          path: '/home/user/project/src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details[0].path).toContain('/home/user/project')
    })

    it('should parse config with relative paths', () => {
      const configContent = createTestConfig([
        {
          path: './src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details[0].path).toContain('./src')
    })

    it('should handle config with extra whitespace', () => {
      const configContent = `{
        "version": "1.0.0",
        "app_details": [
          {
            "path": "./src/main/kotlin",
            "language": "kotlin",
            "mode": "class",
            "alias": "app",
            "type": "code"
          }
        ],
        "destination_folder": "./output"
      }`

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details).toHaveLength(1)
    })

    it('should handle config with different aliases', () => {
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './app1/src',
            language: 'kotlin',
            mode: 'class',
            alias: 'frontend',
            type: 'code'
          },
          {
            path: './app2/src',
            language: 'kotlin',
            mode: 'class',
            alias: 'backend',
            type: 'code'
          }
        ],
        destination_folder: './output'
      })

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details[0].alias).toBe('frontend')
      expect(result.app_details[1].alias).toBe('backend')
    })

    it('should throw error on empty file', () => {
      const configPath = createTestFile(tempDir, 'config.json', '')

      expect(() => readConfig(configPath, schemaPath)).toThrow('Invalid JSON in configuration file')
    })

    it('should throw error on file with only whitespace', () => {
      const configPath = createTestFile(tempDir, 'config.json', '   \n\n   ')

      expect(() => readConfig(configPath, schemaPath)).toThrow('Invalid JSON in configuration file')
    })

    it('should preserve path separators', () => {
      const configContent = createTestConfig([
        {
          path: 'src/main/kotlin',
          language: 'kotlin',
          mode: 'class',
          alias: 'app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(tempDir, 'config.json', configContent)
      const result = readConfig(configPath, schemaPath)

      expect(result.app_details[0].path).toContain('/')
    })

    it('should handle complex real-world config', () => {
      const configContent = JSON.stringify(mockApplicationConfig)
      const configPath = createTestFile(tempDir, 'config.json', configContent)

      const result = readConfig(configPath, schemaPath)

      expect(result).toEqual(mockApplicationConfig)
    })
  })
})
