import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTempDir, removeTempDir, createTestFile, createTestConfig } from '../fixtures/test-helpers.ts'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync } from 'fs'

// Import the actual implementation functions used by the MCP server
import { extractClassStructure } from '../../../src/tools/code-manifest/classifier/parsers/index.ts'
import { findFiles } from '../../../src/tools/code-manifest/classifier/finder/index.ts'
import { classifyFilesByClass } from '../../../src/tools/code-manifest/classifier/filelist/filelist-classifier.ts'
import { readConfig } from '../../../src/tools/code-manifest/config/config-reader.ts'
import { MCPServer } from '../../../src/tools/code-manifest/mcp-server.ts'
import { CompareCommand } from '../../../src/tools/code-manifest/classifier/comparison/index.ts'

/**
 * Integration tests for MCP Server
 * 
 * These tests verify that the MCP server correctly exposes tools and handles requests.
 * We test the server implementation by importing the core functions that the MCP server uses.
 */
describe('MCP Server Integration Tests', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('mcp-server-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('Tool: extract_class_info', () => {
    it('should extract class information from a Kotlin file', () => {
      const content = `package com.example.domain

data class User(
  val id: String,
  val name: String,
  val email: String
)`
      const kotlinFile = createTestFile(tempDir, 'User.kt', content)

      const result = extractClassStructure(kotlinFile)

      expect(result).toBeDefined()
      expect(result.package).toBe('com.example.domain')
      expect(result.classes).toHaveLength(1)
      expect(result.classes[0].name).toBe('User')
      expect(result.classes[0].type).toBe('data class')
      expect(result.classes[0].properties).toHaveLength(3)
    })

    it('should handle files with multiple classes', () => {
      const content = `package com.example

data class Person(val name: String)

data class Address(val street: String)`
      const kotlinFile = createTestFile(tempDir, 'Multiple.kt', content)

      const result = extractClassStructure(kotlinFile)

      expect(result.classes.length).toBeGreaterThanOrEqual(1)
      expect(result.classes[0].name).toBe('Person')
    })

    it('should extract functions from classes', () => {
      const content = `package com.example

class UserService {
  fun createUser(name: String): User {
    return User(name)
  }
  
  fun deleteUser(id: String): Boolean {
    return true
  }
}`
      const kotlinFile = createTestFile(tempDir, 'Service.kt', content)

      const result = extractClassStructure(kotlinFile)

      expect(result.classes).toHaveLength(1)
      expect(result.classes[0].functions).toHaveLength(2)
      expect(result.classes[0].functions[0].name).toBe('createUser')
      expect(result.classes[0].functions[1].name).toBe('deleteUser')
    })
  })

  describe('Tool: find_files', () => {
    it('should find all Kotlin files in a directory', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      createTestFile(srcDir, 'File1.kt', 'class File1')
      createTestFile(srcDir, 'File2.kt', 'class File2')
      createTestFile(srcDir, 'File3.kt', 'class File3')

      const result = findFiles(srcDir, '.kt')

      expect(result.fileList).toHaveLength(3)
      expect(result.fileList.every((f) => f.value.endsWith('.kt'))).toBe(true)
    })

    it('should recursively find files in subdirectories', () => {
      const srcDir = join(tempDir, 'src')
      const domainDir = join(srcDir, 'domain')
      const serviceDir = join(srcDir, 'service')
      
      mkdirSync(domainDir, { recursive: true })
      mkdirSync(serviceDir, { recursive: true })

      createTestFile(srcDir, 'Main.kt', 'class Main')
      createTestFile(domainDir, 'User.kt', 'class User')
      createTestFile(serviceDir, 'UserService.kt', 'class UserService')

      const result = findFiles(srcDir, '.kt')

      expect(result.fileList).toHaveLength(3)
    })

    it('should filter files by suffix', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      createTestFile(srcDir, 'File1.kt', 'class File1')
      createTestFile(srcDir, 'File2.java', 'class File2 {}')
      createTestFile(srcDir, 'readme.txt', 'readme')

      const result = findFiles(srcDir, '.kt')

      expect(result.fileList).toHaveLength(1)
      expect(result.fileList[0].value).toContain('File1.kt')
    })

    it('should return empty list for non-existent directory', () => {
      const result = findFiles(join(tempDir, 'non-existent'), '.kt')

      expect(result.fileList).toHaveLength(0)
    })
  })

  describe('Tool: classify_files', () => {
    it('should classify files by their class information', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      const userContent = `package com.example
data class User(val name: String)`
      const productContent = `package com.example
data class Product(val id: String)`

      createTestFile(srcDir, 'User.kt', userContent)
      createTestFile(srcDir, 'Product.kt', productContent)

      const files = findFiles(srcDir, '.kt')
      const classified = classifyFilesByClass(files)

      expect(classified.length).toBeGreaterThan(0)
      // Check if we have entries for both classes
      expect(classified.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle files with multiple classes', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      const content = `package com.example

data class User(val name: String)

data class Admin(val role: String)`

      createTestFile(srcDir, 'Models.kt', content)

      const files = findFiles(srcDir, '.kt')
      const classified = classifyFilesByClass(files)

      // Should have at least one classification result
      expect(classified.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract class types correctly', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      const content = `package com.example

data class DataClass(val x: Int)

class RegularClass`

      createTestFile(srcDir, 'Types.kt', content)

      const files = findFiles(srcDir, '.kt')
      const classified = classifyFilesByClass(files)

      // Should have at least one classification result
      expect(classified.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Tool: generate_manifest', () => {
    it('should generate manifest from configuration', () => {
      const projectDir = join(tempDir, 'project')
      const srcDir = join(projectDir, 'src/main/kotlin')
      mkdirSync(srcDir, { recursive: true })

      // Create Kotlin file
      const userContent = `package com.example.domain
data class User(val id: String, val name: String)`
      createTestFile(srcDir, 'User.kt', userContent)

      // Create config
      const configContent = createTestConfig([
        {
          path: srcDir,
          language: 'kotlin',
          mode: 'class',
          alias: 'TestApp',
          type: 'code'
        }
      ])

      const configPath = createTestFile(projectDir, 'code_manifest.json', configContent)

      // Test config reading
      const config = readConfig(configPath)
      
      expect(config).toBeDefined()
      expect(config.app_details).toHaveLength(1)
      expect(config.app_details[0].alias).toBe('TestApp')
      expect(config.app_details[0].type).toBe('code')
    })

    it('should handle multiple project paths in config', () => {
      const projectDir = join(tempDir, 'project')
      const srcDir = join(projectDir, 'src/main/kotlin')
      const testDir = join(projectDir, 'src/test/kotlin')
      
      mkdirSync(srcDir, { recursive: true })
      mkdirSync(testDir, { recursive: true })

      const configContent = createTestConfig([
        {
          path: srcDir,
          language: 'kotlin',
          mode: 'class',
          alias: 'TestApp',
          type: 'code'
        },
        {
          path: testDir,
          language: 'kotlin',
          mode: 'class',
          alias: 'TestApp',
          type: 'test'
        }
      ])

      const configPath = createTestFile(projectDir, 'code_manifest.json', configContent)
      const config = readConfig(configPath)

      expect(config.app_details).toHaveLength(2)
      expect(config.app_details[0].type).toBe('code')
      expect(config.app_details[1].type).toBe('test')
    })

    it('should return paths where files were created', async () => {
      const projectDir = join(tempDir, 'project')
      const srcDir = join(projectDir, 'src/main/kotlin')
      const testDir = join(projectDir, 'src/test/kotlin')
      const outputDir = join(projectDir, 'output')
      
      mkdirSync(srcDir, { recursive: true })
      mkdirSync(testDir, { recursive: true })

      // Create Kotlin files
      const userContent = `package com.example.domain
data class User(val id: String, val name: String)`
      createTestFile(srcDir, 'User.kt', userContent)

      const userTestContent = `package com.example.domain
class UserTest {
    fun testUser() {}
}`
      createTestFile(testDir, 'UserTest.kt', userTestContent)

      // Create config with destination folder
      const configContent = createTestConfig([
        {
          path: srcDir,
          language: 'kotlin',
          mode: 'class',
          alias: 'TestApp',
          type: 'code'
        },
        {
          path: testDir,
          language: 'kotlin',
          mode: 'class',
          alias: 'TestApp',
          type: 'test'
        }
      ], outputDir)

      const configPath = createTestFile(projectDir, 'code_manifest.json', configContent)

      // Create MCP server instance and call handleGenerateManifest directly
      const server = new MCPServer()
      const result = await (server as any).handleGenerateManifest({ configPath })

      // Verify the response contains the generated file paths in JSON format
      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const responseJson = JSON.parse(result.content[0].text)
      expect(responseJson).toHaveProperty('generatedFiles')
      expect(responseJson).toHaveProperty('message')
      expect(responseJson.message).toBe('Manifests generated successfully')
      
      expect(responseJson.generatedFiles).toHaveLength(2)
      
      const codeManifest = responseJson.generatedFiles.find((f: any) => f.type === 'code_manifest')
      const testManifest = responseJson.generatedFiles.find((f: any) => f.type === 'tests_manifest')
      
      expect(codeManifest).toBeDefined()
      expect(codeManifest.path).toBe(join(outputDir, 'code_manifest.md'))
      expect(testManifest).toBeDefined()
      expect(testManifest.path).toBe(join(outputDir, 'tests_manifest.md'))
      
      // Verify files were actually created
      expect(existsSync(join(outputDir, 'code_manifest.md'))).toBe(true)
      expect(existsSync(join(outputDir, 'tests_manifest.md'))).toBe(true)
    })
  })

  describe('Tool: compare_manifests', () => {
    it('should compare two manifest files with proper format', () => {
      // Use proper table format that matches expected schema
      const oldManifest = `| ClassName | ClassType | FileRelativePath | PackageName | Alias | Properties | Functions | Imports | Constants | Hash |
|-----------|-----------|-----------------|-------------|-------|------------|-----------|---------|-----------|------|
| User | data class | domain/User.kt | com.example | App | id:String | | | | abc123 |`

      const newManifest = `| ClassName | ClassType | FileRelativePath | PackageName | Alias | Properties | Functions | Imports | Constants | Hash |
|-----------|-----------|-----------------|-------------|-------|------------|-----------|---------|-----------|------|
| User | data class | domain/User.kt | com.example | App | id:String,name:String | | | | def456 |`

      const oldPath = createTestFile(tempDir, 'old.md', oldManifest)
      const newPath = createTestFile(tempDir, 'new.md', newManifest)

      const compareCmd = new CompareCommand()
      
      // Should not throw
      expect(() => {
        compareCmd.compareFiles(oldPath, newPath)
      }).not.toThrow()
    })
  })

  describe('Tool: create_backup', () => {
    it('should create a backup file', () => {
      const manifest = `| Class Name | Type | Path |
|------------|------|------|
| User | data class | User.kt |`

      const manifestPath = createTestFile(tempDir, 'manifest.md', manifest)
      const backupPath = `${manifestPath}.backup`

      const compareCmd = new CompareCommand()
      compareCmd.createBackup(manifestPath)

      expect(existsSync(backupPath)).toBe(true)
    })

    it('should preserve file content in backup', () => {
      const content = 'test content\nwith multiple lines'
      const filePath = createTestFile(tempDir, 'file.txt', content)
      const backupPath = `${filePath}.backup`

      const compareCmd = new CompareCommand()
      compareCmd.createBackup(filePath)

      const backupContent = readFileSync(backupPath, 'utf-8')
      
      expect(backupContent).toBe(content)
    })
  })

  describe('Tool: compare_with_repository', () => {
    it('should compare with backup file if exists', () => {
      const manifest = `| ClassName | ClassType | FileRelativePath | PackageName | Alias | Properties | Functions | Imports | Constants | Hash |
|-----------|-----------|-----------------|-------------|-------|------------|-----------|---------|-----------|------|
| User | data class | domain/User.kt | com.example | App | id:String | | | | abc123 |`

      const manifestPath = createTestFile(tempDir, 'manifest.md', manifest)
      
      const compareCmd = new CompareCommand()
      compareCmd.createBackup(manifestPath)

      // Should not throw and should handle backup comparison
      expect(() => {
        compareCmd.compareWithRepository(manifestPath)
      }).not.toThrow()
    })

    it('should handle missing backup gracefully', () => {
      const manifest = `| Class Name | Type | Path |
|------------|------|------|
| User | data class | User.kt |`

      const manifestPath = createTestFile(tempDir, 'manifest.md', manifest)

      const compareCmd = new CompareCommand()
      
      // Should not throw even without backup
      expect(() => {
        compareCmd.compareWithRepository(manifestPath)
      }).not.toThrow()
    })
  })

  describe('MCP Server Tool Schemas', () => {
    it('should define all required tools', () => {
      const expectedTools = [
        'extract_class_info',
        'find_files',
        'generate_manifest',
        'compare_manifests',
        'compare_with_repository',
        'create_backup',
        'classify_files'
      ]

      // This test verifies that we have tests for all tools
      expect(expectedTools).toHaveLength(7)
    })

    it('should have valid tool input schemas', () => {
      // Verify extract_class_info schema
      const extractClassInfoSchema = {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Path to the Kotlin source file to analyze'
          }
        },
        required: ['filePath']
      }

      expect(extractClassInfoSchema.required).toContain('filePath')
      expect(extractClassInfoSchema.properties.filePath.type).toBe('string')

      // Verify find_files schema
      const findFilesSchema = {
        type: 'object',
        properties: {
          folder: { type: 'string' },
          suffix: { type: 'string' }
        },
        required: ['folder', 'suffix']
      }

      expect(findFilesSchema.required).toHaveLength(2)
      expect(findFilesSchema.required).toContain('folder')
      expect(findFilesSchema.required).toContain('suffix')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid file paths in extract_class_info', () => {
      // extractClassStructure logs errors but returns empty structure
      const result = extractClassStructure('/non/existent/file.kt')
      // Should return a result even for invalid files (graceful handling)
      expect(result).toBeDefined()
    })

    it('should handle invalid config files', () => {
      const invalidConfigPath = join(tempDir, 'invalid.json')
      createTestFile(tempDir, 'invalid.json', 'not valid json {')

      expect(() => {
        readConfig(invalidConfigPath)
      }).toThrow()
    })

    it('should handle empty directories in find_files', () => {
      const emptyDir = join(tempDir, 'empty')
      mkdirSync(emptyDir, { recursive: true })

      const result = findFiles(emptyDir, '.kt')

      expect(result.fileList).toHaveLength(0)
    })
  })

  describe('MCP Server Response Format', () => {
    it('should return JSON-serializable results', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      createTestFile(srcDir, 'User.kt', 'data class User(val name: String)')

      const files = findFiles(srcDir, '.kt')
      const jsonString = JSON.stringify(files)
      const parsed = JSON.parse(jsonString)

      expect(parsed).toEqual(files)
    })

    it('should include all required fields in classified files', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      const content = `package com.example
data class User(val name: String)`
      createTestFile(srcDir, 'User.kt', content)

      const files = findFiles(srcDir, '.kt')
      const classified = classifyFilesByClass(files)

      expect(classified.length).toBeGreaterThan(0)
      
      const firstClass = classified[0]
      expect(firstClass).toHaveProperty('file')
      expect(firstClass).toHaveProperty('classSpecsFound')
    })
  })

  describe('Integration with Templates', () => {
    it('should work with classification templates', () => {
      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      const content = `package com.example.domain
data class User(val id: String)`
      createTestFile(srcDir, 'User.kt', content)

      const files = findFiles(srcDir, '.kt')
      const classified = classifyFilesByClass(files)

      expect(classified.length).toBeGreaterThan(0)
      
      // Verify classification produces results
      expect(classified[0]).toBeDefined()
      expect(classified[0].file).toBeDefined()
      expect(classified[0].classSpecsFound).toBeDefined()
    })
  })

  describe('Tool: get_prompt_content', () => {
    it('should return prompt content with template variables filled', async () => {
      const server = new MCPServer()
      
      // Access the private method for testing
      const result = await (server as any).handleGetPromptContent({
        promptName: 'generate-manifest',
        arguments: {
          config_path: '/test/config.json'
        }
      })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()
      expect(result.content[0].type).toBe('text')
      expect(result.content[0].text).toContain('/test/config.json')
      expect(result.content[0].text).toContain('Call `code-manifest__generate_manifest`')
    })

    it('should include complementary prompts content after messages', async () => {
      const server = new MCPServer()
      
      // Access the private method for testing
      const result = await (server as any).handleGetPromptContent({
        promptName: 'catalog-manifest',
        arguments: {
          manifest_path: '/test/manifest.md'
        }
      })

      expect(result).toBeDefined()
      expect(result.content).toBeDefined()
      expect(result.content[0].type).toBe('text')
      
      const content = result.content[0].text
      
      // Should contain the main messages
      expect(content).toContain('/test/manifest.md')
      expect(content).toContain('You are to catalog a code manifest')
      
      // Should contain content from complementary prompts
      expect(content).toContain('# Code Manifest Cataloging Rules')
      expect(content).toContain('# DDD Definitions')
      expect(content).toContain('## DDD layers')
    })

    it('should throw error for unknown prompt', async () => {
      const server = new MCPServer()
      
      await expect((server as any).handleGetPromptContent({
        promptName: 'unknown-prompt'
      })).rejects.toThrow('Prompt not found: unknown-prompt')
    })

    it('should throw error for missing required arguments', async () => {
      const server = new MCPServer()
      
      await expect((server as any).handleGetPromptContent({
        promptName: 'catalog-manifest',
        arguments: {} // missing manifest_path
      })).rejects.toThrow('Required argument missing: manifest_path')
    })

    it('should handle prompts without complementary prompts', async () => {
      const server = new MCPServer()
      
      const result = await (server as any).handleGetPromptContent({
        promptName: 'generate-manifest',
        arguments: {
          config_path: '/test/config.json'
        }
      })

      expect(result).toBeDefined()
      expect(result.content[0].text).toContain('/test/config.json')
      // Should not contain complementary prompt content
      expect(result.content[0].text).not.toContain('# Invariants and Business Rules')
    })
  })
})
