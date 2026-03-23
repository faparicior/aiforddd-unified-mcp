import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { PromptManager } from '../../../src/tools/code-manifest/core.ts'

// Import the prompt parsing logic for integration testing
// Since the PromptServer class is not directly testable for MCP protocol,
// we'll test the core functionality that would be used by MCP clients

const WOW_PROMPT_NAMES = [
  'create-controller-wow',
  'create-use-case-wow',
  'create-value-object-wow',
  'create-event-consumer-wow',
  'create-scheduler-wow',
  'create-repository-wow',
  'create-event-producer-wow',
  'create-api-client-wow',
]

describe('Prompt Server Integration Tests', () => {
  describe('PromptManager auto-discovery', () => {
    it('should load all .yml files from the prompts directory without a hardcoded list', () => {
      const promptsDir = join(process.cwd(), 'src', 'prompts')
      const ymlFiles = readdirSync(promptsDir).filter(f => f.endsWith('.yml'))

      const manager = new PromptManager()

      for (const file of ymlFiles) {
        const promptName = file.replace('.yml', '')
        // getPromptContent throws if the prompt is not loaded — use a dummy manifest_path
        expect(() => manager.getPromptContent(promptName, { manifest_path: '/test' })).not.toThrow()
      }
    })

    it('should discover at least the catalog-manifest and all wow prompts', () => {
      const manager = new PromptManager()
      const allExpected = ['catalog-manifest', ...WOW_PROMPT_NAMES]

      for (const name of allExpected) {
        expect(() => manager.getPromptContent(name, { manifest_path: '/test' })).not.toThrow()
      }
    })

    it('should throw for a non-existent prompt name', () => {
      const manager = new PromptManager()
      expect(() => manager.getPromptContent('does-not-exist')).toThrow('Prompt not found: does-not-exist')
    })
  })

  describe('WoW prompts structure', () => {
    it.each(WOW_PROMPT_NAMES)('prompt %s should have manifest_path as required argument', (promptName) => {
      const promptPath = join(process.cwd(), 'src', 'prompts', `${promptName}.yml`)
      const content = readFileSync(promptPath, 'utf-8')

      expect(content).toContain('name: manifest_path')
      expect(content).toContain('required: true')
    })

    it.each(WOW_PROMPT_NAMES)('prompt %s messages should reference {{manifest_path}}', (promptName) => {
      const promptPath = join(process.cwd(), 'src', 'prompts', `${promptName}.yml`)
      const content = readFileSync(promptPath, 'utf-8')

      expect(content).toContain('{{manifest_path}}')
    })

    it.each(WOW_PROMPT_NAMES)('prompt %s should reference the correct template file', (promptName) => {
      const promptPath = join(process.cwd(), 'src', 'prompts', `${promptName}.yml`)
      const content = readFileSync(promptPath, 'utf-8')

      // Each wow prompt must call get_template_content with a template path
      expect(content).toContain('get_template_content')
      expect(content).toContain('wow/')
    })

    it.each(WOW_PROMPT_NAMES)('PromptManager should substitute manifest_path in %s', (promptName) => {
      const manager = new PromptManager()
      const result = manager.getPromptContent(promptName, { manifest_path: '/my/project/.aiforddd' })

      expect(result).toContain('/my/project/.aiforddd')
      expect(result).not.toContain('{{manifest_path}}')
    })
  })

  describe('YAML Prompt Loading', () => {

    it('should load and parse the catalog-manifest.yml prompt with complementary prompts', () => {
      const promptPath = join(process.cwd(), 'src', 'prompts', 'catalog-manifest.yml')
      const content = readFileSync(promptPath, 'utf-8')

      // Parse manually like the server does (updated version)
      const lines = content.split('\n')
      let currentSection = ''
      const prompt: any = {
        arguments: [],
        complementary_prompts: []
      }

      for (const line of lines) {
        if (line.startsWith('name:')) {
          prompt.name = line.substring(5).trim()
        } else if (line.startsWith('description:')) {
          prompt.description = line.substring(12).trim()
        } else if (line.startsWith('arguments:')) {
          currentSection = 'arguments'
        } else if (line.startsWith('complementary_prompts:')) {
          currentSection = 'complementary_prompts'
          prompt.complementary_prompts = []
        } else if (line.startsWith('messages:')) {
          currentSection = 'messages'
          prompt.messages = ''
        } else if (line.startsWith('  - name:')) {
          if (currentSection === 'arguments') {
            const argName = line.substring(10).trim()
            prompt.arguments.push({ name: argName, required: false })
          } else if (currentSection === 'complementary_prompts') {
            const promptName = line.substring(10).trim()
            prompt.complementary_prompts.push({ name: promptName })
          }
        } else if (line.startsWith('    required:')) {
          const lastArg = prompt.arguments[prompt.arguments.length - 1]
          lastArg.required = line.substring(14).trim() === 'true'
        } else if (currentSection === 'messages' && line.startsWith('  ')) {
          prompt.messages += line.substring(2) + '\n'
        }
      }

      expect(prompt.name).toBe('catalog-manifest')
      expect(prompt.description).toBe('Catalog a code manifest with accelerated batch processing and complete file reading')
      expect(prompt.arguments).toHaveLength(1)
      expect(prompt.arguments[0]).toEqual({ name: 'manifest_path', required: true })
      expect(prompt.complementary_prompts).toHaveLength(4)
      expect(prompt.complementary_prompts[0]).toEqual({ name: 'definitions/ddd-definitions.md' })
      expect(prompt.complementary_prompts[1]).toEqual({ name: 'definitions/code-manifest-definitions.md' })
      expect(prompt.complementary_prompts[2]).toEqual({ name: 'definitions/ddd-classification-rules.md' })
      expect(prompt.complementary_prompts[3]).toEqual({ name: 'definitions/ddd-classification-critical-distinctions.md' })
      expect(prompt.messages).toContain('{{manifest_path}}')
    })
  })

  describe('Template Filling', () => {
    it('should fill template variables correctly', () => {
      const template = 'Generate a code manifest using the configuration file at: {{config_path}}. The config contains app_details with paths to code sources and a destination_folder for output.'
      const args = {
        config_path: '/path/to/code'
      }

      let result = template
      for (const [key, value] of Object.entries(args)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      }

      expect(result).toBe('Generate a code manifest using the configuration file at: /path/to/code. The config contains app_details with paths to code sources and a destination_folder for output.')
    })

    it('should handle missing arguments', () => {
      const template = 'Generate for {{config_path}} and {{missing_arg}}.'
      const args = {
        config_path: '/path/to/code'
      }

      let result = template
      for (const [key, value] of Object.entries(args)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      }

      expect(result).toBe('Generate for /path/to/code and {{missing_arg}}.')
    })
  })

  describe('Argument Validation', () => {
    const promptDef = {
      name: 'test prompt',
      description: 'test',
      arguments: [
        { name: 'required1', required: true },
        { name: 'required2', required: true },
        { name: 'optional1', required: false }
      ],
      messages: 'Test message'
    }

    it('should validate required arguments are present', () => {
      const args = {
        required1: 'value1',
        required2: 'value2',
        optional1: 'value3'
      }

      for (const arg of promptDef.arguments) {
        if (arg.required && !(arg.name in args)) {
          throw new Error(`Required argument missing: ${arg.name}`)
        }
      }

      // Should not throw
      expect(true).toBe(true)
    })

    it('should throw error for missing required arguments', () => {
      const args = {
        required1: 'value1'
        // missing required2
      }

      expect(() => {
        for (const arg of promptDef.arguments) {
          if (arg.required && !(arg.name in args)) {
            throw new Error(`Required argument missing: ${arg.name}`)
          }
        }
      }).toThrow('Required argument missing: required2')
    })

    it('should allow missing optional arguments', () => {
      const args = {
        required1: 'value1',
        required2: 'value2'
        // optional1 is missing, should be OK
      }

      expect(() => {
        for (const arg of promptDef.arguments) {
          if (arg.required && !(arg.name in args)) {
            throw new Error(`Required argument missing: ${arg.name}`)
          }
        }
      }).not.toThrow()
    })
  })
})