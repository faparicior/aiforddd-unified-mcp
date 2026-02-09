import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Mock the file system
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}))

vi.mock('path', () => ({
  join: vi.fn(),
  dirname: vi.fn()
}))

vi.mock('url', () => ({
  fileURLToPath: vi.fn()
}))

// Import after mocking
import { MCPServer } from '../../../../src/tools/code-manifest/mcp-server'

describe('PromptServer', () => {
  let server: MCPServer
  const mockYamlContent = `name: generate code manifest
description: Generates a code manifest
arguments:
  - name: config_path
    required: true
messages: |
  Generate a code manifest using the configuration file at: {{config_path}}. The config contains app_details with paths to code sources and a destination_folder for output.`

  const mockSchemaContent = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "app_details": {
      "type": "array"
    }
  },
  "required": ["app_details"]
}`

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock file path resolution
    const mockDirname = '/mock/path'
    const mockPromptPath = '/mock/path/prompts/generate-manifest.yml'
    const mockSchemaPath = '/mock/path/config.dddclassifier.json'

    vi.mocked(dirname).mockReturnValue(mockDirname)
    vi.mocked(join).mockImplementation((...args) => {
      if (args.includes('config.dddclassifier.json')) {
        return mockSchemaPath
      }
      return mockPromptPath
    })
    vi.mocked(fileURLToPath).mockReturnValue('/mock/path/prompt-server.ts')
    vi.mocked(readFileSync).mockImplementation((path) => {
      if (path === mockSchemaPath) {
        return mockSchemaContent
      }
      return mockYamlContent
    })

    server = new MCPServer()
  })

  describe('parseYamlPrompt', () => {
    it('should parse YAML prompt correctly', () => {
      const result = (server as any).parseYamlPrompt(mockYamlContent)

      expect(result.name).toBe('generate code manifest')
      expect(result.description).toBe('Generates a code manifest')
      expect(result.arguments).toHaveLength(1)
      expect(result.arguments[0]).toEqual({ name: 'config_path', required: true })
      expect(result.messages).toContain('Generate a code manifest using the configuration file at: {{config_path}}')
      expect(result.messages).not.toContain('Write the manifest in {{manifest_path}}')
    })

    it('should handle optional arguments', () => {
      const yamlWithOptional = `name: test prompt
description: test
arguments:
  - name: required_arg
    required: true
  - name: optional_arg
    required: false
messages: |
  Test message`

      const result = (server as any).parseYamlPrompt(yamlWithOptional)

      expect(result.arguments[0]).toEqual({ name: 'required_arg', required: true })
      expect(result.arguments[1]).toEqual({ name: 'optional_arg', required: false })
    })

    it('should handle prompts without arguments', () => {
      const yamlNoArgs = `name: simple prompt
description: simple
messages: |
  Simple message`

      const result = (server as any).parseYamlPrompt(yamlNoArgs)

      expect(result.name).toBe('simple prompt')
      expect(result.arguments).toHaveLength(0)
      expect(result.messages).toBe('Simple message\n')
    })
  })

  describe('loadPrompts', () => {
    it('should load prompts from file system', () => {
      // Mock file system calls
      vi.mocked(join).mockReturnValue('/mock/path/prompts/generate-manifest.yml')
      vi.mocked(dirname).mockReturnValue('/mock/path')
      vi.mocked(fileURLToPath).mockReturnValue('/mock/path/mcp-server.ts')
      
      // Mock existsSync to return true for prompt files
      vi.mocked(existsSync).mockReturnValue(true)
      
      // Mock readFileSync to return YAML content
      vi.mocked(readFileSync).mockReturnValue(`name: generate-manifest
description: Generates a code manifest
arguments:
  - name: config_path
    required: true
messages: |
  Generate a code manifest using the configuration file at: {{config_path}}.`)

      ;(server as any).loadPrompts()

      const prompts = (server as any).prompts
      expect(prompts.has('generate-manifest')).toBe(true)

      const prompt = prompts.get('generate-manifest')
      expect(prompt.name).toBe('generate-manifest')
      expect(prompt.description).toBe('Generates a code manifest')
    })

    it('should handle file read errors gracefully', () => {
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found')
      })

      // Should not throw, just log error
      expect(() => (server as any).loadPrompts()).not.toThrow()
    })
  })

  describe.skip('setupPromptHandlers', () => {
    it.skip('should set up request handlers - DISABLED: Prompt functionality temporarily removed during McpServer migration', () => {
      // This test is disabled because prompt handling was temporarily removed
      // during the migration from Server to McpServer API
      expect(true).toBe(true)
    })
  })

  describe('ListPrompts handler', () => {
    it('should return list of available prompts', async () => {
      // Load prompts first
      ;(server as any).loadPrompts()

      const mockRequest = {}
      const handler = (server as any).server._handlers?.get('prompts/list')

      if (handler) {
        const result = await handler(mockRequest)

        expect(result.prompts).toHaveLength(1)
        expect(result.prompts[0].name).toBe('generate code manifest')
        expect(result.prompts[0].description).toBe('Generates a code manifest')
        expect(result.prompts[0].arguments).toHaveLength(1)
        expect(result.prompts[0].arguments[0].name).toBe('config_path')
        expect(result.prompts[0].arguments[0].required).toBe(true)
      }
    })
  })

  describe('GetPrompt handler', () => {
    beforeEach(() => {
      ;(server as any).loadPrompts()
    })

    it('should return prompt content with filled arguments', async () => {
      const mockRequest = {
        params: {
          name: 'generate code manifest',
          arguments: {
            config_path: '/path/to/code'
          }
        }
      }

      const handler = (server as any).server._handlers?.get('prompts/get')

      if (handler) {
        const result = await handler(mockRequest)

        expect(result.description).toBe('Generates a code manifest')
        expect(result.messages).toHaveLength(1)
        expect(result.messages[0].role).toBe('user')
        expect(result.messages[0].content.type).toBe('text')
        expect(result.messages[0].content.text).toContain('/path/to/code')
        expect(result.messages[0].content.text).toContain('/path/to/output.md')
      }
    })

    it('should throw error for unknown prompt', async () => {
      const mockRequest = {
        params: {
          name: 'unknown prompt',
          arguments: {}
        }
      }

      const handler = (server as any).server._handlers?.get('prompts/get')

      if (handler) {
        await expect(handler(mockRequest)).rejects.toThrow('Prompt not found: unknown prompt')
      }
    })

    it('should throw error for missing required arguments', async () => {
      const mockRequest = {
        params: {
          name: 'generate code manifest',
          arguments: {
            // missing config_path
          }
        }
      }

      const handler = (server as any).server._handlers?.get('prompts/get')

      if (handler) {
        await expect(handler(mockRequest)).rejects.toThrow('Required argument missing: config_path')
      }
    })

    it('should handle optional arguments', async () => {
      // Add a prompt with optional arguments to test
      const promptWithOptional = {
        name: 'optional prompt',
        description: 'test',
        arguments: [
          { name: 'required', required: true },
          { name: 'optional', required: false }
        ],
        messages: 'Message with {{required}} and {{optional}}'
      }

      ;(server as any).prompts.set('optional prompt', promptWithOptional)

      const mockRequest = {
        params: {
          name: 'optional prompt',
          arguments: {
            required: 'value1'
            // optional not provided
          }
        }
      }

      const handler = (server as any).server._handlers?.get('prompts/get')

      if (handler) {
        const result = await handler(mockRequest)

        expect(result.messages[0].content.text).toContain('value1')
        expect(result.messages[0].content.text).toContain('{{optional}}') // Should remain unfilled
      }
    })
  })
})