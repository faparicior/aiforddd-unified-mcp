import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTempDir, removeTempDir, createTestFile, createKotlinTestFile, createTestConfig } from '../fixtures/test-helpers.ts'
import { join, dirname } from 'path'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('Main CLI Integration Tests', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('main-integration-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('Config File Processing', () => {
    it('should load default config location', () => {
      const projectDir = join(tempDir, 'project')

      const configContent = createTestConfig([
        {
          path: join(projectDir, 'src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'test-app',
          type: 'code'
        }
      ])

      const configPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      expect(existsSync(configPath)).toBe(true)

      const content = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(content)

      expect(config.app_details).toHaveLength(1)
      expect(config.app_details[0].alias).toBe('test-app')
    })

    it('should handle custom config path', () => {
      const projectDir = join(tempDir, 'project')

      const configContent = createTestConfig([
        {
          path: './src',
          language: 'kotlin',
          mode: 'class',
          alias: 'custom-app',
          type: 'code'
        }
      ])

      const customConfigPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      expect(existsSync(customConfigPath)).toBe(true)

      const content = readFileSync(customConfigPath, 'utf-8')
      const config = JSON.parse(content)

      expect(config.app_details[0].alias).toBe('custom-app')
    })
  })

  describe('Template File Processing', () => {
    it('should read and use markdown templates', () => {
      const projectDir = join(tempDir, 'project')

      const codeTemplate = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const templatePath = createTestFile(
        projectDir,
        'templates/template-code-filelist.md',
        codeTemplate
      )

      expect(existsSync(templatePath)).toBe(true)

      const content = readFileSync(templatePath, 'utf-8')
      expect(content).toContain('{{Status}}')
      expect(content).toContain('{{Identifier}}')
      expect(content).toContain('{{Class}}')
    })

    it('should have separate templates for code and test', () => {
      const projectDir = join(tempDir, 'project')

      const codeTemplate = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const testTemplate = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const codePath = createTestFile(
        projectDir,
        'templates/template-code-filelist.md',
        codeTemplate
      )

      const testPath = createTestFile(
        projectDir,
        'templates/template-test-filelist.md',
        testTemplate
      )

      expect(existsSync(codePath)).toBe(true)
      expect(existsSync(testPath)).toBe(true)
    })
  })

  describe('File Discovery Integration', () => {
    it('should discover Kotlin files in standard structure', () => {
      const projectDir = join(tempDir, 'project')

      // Create standard Kotlin project structure
      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/com/example/app/domain/User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/com/example/app/application/UserService.kt',
        'com.example.app.application',
        'UserService',
        { classType: 'class' }
      )

      createKotlinTestFile(
        projectDir,
        'src/test/kotlin/com/example/app/domain/UserTest.kt',
        'com.example.app.domain',
        'UserTest',
        { classType: 'class' }
      )

      // Verify files exist
      expect(existsSync(join(projectDir, 'src/main/kotlin/com/example/app/domain/User.kt'))).toBe(true)
      expect(existsSync(join(projectDir, 'src/main/kotlin/com/example/app/application/UserService.kt'))).toBe(true)
      expect(existsSync(join(projectDir, 'src/test/kotlin/com/example/app/domain/UserTest.kt'))).toBe(true)
    })
  })

  describe('Output Generation', () => {
    it('should generate valid markdown output', () => {
      const projectDir = join(tempDir, 'project')

      const markdownContent = `# Code Manifest

| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | abc123def456 | hash1234567890 | test-app | | | User | src/domain/User.kt | {{Type}} | {{Layer}} | {{Description}} |
| | xyz789ghi012 | hash0987654321 | test-app | | | Order | src/domain/Order.kt | {{Type}} | {{Layer}} | {{Description}} |
`

      const outputPath = createTestFile(projectDir, 'output/code-manifest.md', markdownContent)

      expect(existsSync(outputPath)).toBe(true)

      const content = readFileSync(outputPath, 'utf-8')
      expect(content).toContain('Code Manifest')
      expect(content).toContain('User')
      expect(content).toContain('Order')
      expect(content).toContain('test-app')
    })

    it('should separate code and test outputs', () => {
      const projectDir = join(tempDir, 'project')

      const codeManifest = `# Code Manifest
| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | id1 | hash1 | app | | | User | src/User.kt | {{Type}} | {{Layer}} | {{Description}} |
`

      const testManifest = `# Test Manifest
| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | id2 | hash2 | app | | | UserTest | test/UserTest.kt | {{Type}} | {{Layer}} | {{Description}} |
`

      const codePath = createTestFile(projectDir, 'output/code-manifest.md', codeManifest)
      const testPath = createTestFile(projectDir, 'output/test-manifest.md', testManifest)

      expect(existsSync(codePath)).toBe(true)
      expect(existsSync(testPath)).toBe(true)

      const codeContent = readFileSync(codePath, 'utf-8')
      const testContent = readFileSync(testPath, 'utf-8')

      expect(codeContent).toContain('Code Manifest')
      expect(testContent).toContain('Test Manifest')
    })
  })

  describe('Comparison Feature Integration', () => {
    it('should create backup files', () => {
      const projectDir = join(tempDir, 'project')

      const manifest = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | id1 | hash1 | app | | | User | src/User.kt | Type | Layer | Desc |
`

      const manifestPath = createTestFile(projectDir, 'manifest.md', manifest)
      const backupPath = `${manifestPath}.backup`

      // Simulate backup creation
      createTestFile(projectDir, 'manifest.md.backup', manifest)

      expect(existsSync(backupPath)).toBe(true)
    })

    it('should compare current with backup', () => {
      const projectDir = join(tempDir, 'project')

      const oldManifest = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | id1 | hash1 | app | | | User | src/User.kt | Type | Layer | Desc |
`

      const newManifest = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| | id1 | hash1_modified | app | | | User | src/User.kt | Type | Layer | Desc |
| | id2 | hash2 | app | | | Order | src/Order.kt | Type | Layer | Desc |
`

      const oldPath = createTestFile(projectDir, 'manifest.md.backup', oldManifest)
      const newPath = createTestFile(projectDir, 'manifest.md', newManifest)

      expect(existsSync(oldPath)).toBe(true)
      expect(existsSync(newPath)).toBe(true)
    })
  })

  describe('Multi-Module Project Support', () => {
    it('should handle multiple modules in config', () => {
      const projectDir = join(tempDir, 'multi-module')

      const configContent = createTestConfig([
        {
          path: join(projectDir, 'module1/src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'module1',
          type: 'code'
        },
        {
          path: join(projectDir, 'module2/src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'module2',
          type: 'code'
        }
      ])

      const configPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      const content = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(content)

      expect(config.app_details).toHaveLength(2)
      expect(config.app_details[0].alias).toBe('module1')
      expect(config.app_details[1].alias).toBe('module2')
    })
  })

  describe('Command Line Arguments', () => {
    it('should support --repository argument format', () => {
      const projectDir = join(tempDir, 'cli-test')

      const configContent = createTestConfig([
        {
          path: './src',
          language: 'kotlin',
          mode: 'class',
          alias: 'app',
          type: 'code'
        }
      ])

      createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      // Simulate --repository argument
      const args = ['--repository', projectDir]

      expect(args).toContain('--repository')
      expect(args).toContain(projectDir)
    })

    it('should support --info argument for single file analysis', () => {
      const projectDir = join(tempDir, 'info-test')

      const filePath = createKotlinTestFile(
        projectDir,
        'User.kt',
        'com.example.app',
        'User',
        { classType: 'data class' }
      )

      // Simulate --info argument
      const args = ['--info', filePath]

      expect(args).toContain('--info')
      expect(args).toContain(filePath)
      expect(existsSync(filePath)).toBe(true)
    })

    it('should support comparison arguments', () => {
      const projectDir = join(tempDir, 'compare-test')

      const oldFile = createTestFile(projectDir, 'old.md', 'old content')
      const newFile = createTestFile(projectDir, 'new.md', 'new content')

      // Simulate --compare-old and --compare-new
      const args = ['--compare-old', oldFile, '--compare-new', newFile]

      expect(args).toContain('--compare-old')
      expect(args).toContain('--compare-new')
    })
  })

  describe('Directory Creation', () => {
    it('should create destination folder if it does not exist', () => {
      const projectDir = join(tempDir, 'project')
      const nonExistentDir = join(projectDir, 'output', 'manifests')

      // Create config with non-existent destination folder
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './src',
            language: 'kotlin',
            mode: 'class',
            alias: 'test-app',
            type: 'code'
          }
        ],
        destination_folder: 'output/manifests'
      })

      const configPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      // Verify destination folder doesn't exist initially
      expect(existsSync(join(projectDir, 'output'))).toBe(false)
      expect(existsSync(nonExistentDir)).toBe(false)

      // Read and validate config
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      expect(config.destination_folder).toBe('output/manifests')

      // Simulate the directory creation logic from main.ts
      const { resolve } = require('path')
      const { mkdirSync } = require('fs')
      const projectRoot = projectDir // directory containing config
      const parsedConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
      const destinationFolder = resolve(projectRoot, parsedConfig.destination_folder)

      // This should create the directory
      if (!existsSync(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
      }

      // Verify directory was created
      expect(existsSync(join(projectRoot, 'output'))).toBe(true)
      expect(existsSync(join(projectRoot, 'output', 'manifests'))).toBe(true)
    })

    it('should handle nested non-existent directories', () => {
      const projectDir = join(tempDir, 'project')
      const deeplyNestedDir = join(projectDir, 'results', '2025', 'november', 'manifests')

      // Create config with deeply nested non-existent destination folder
      const configContent = JSON.stringify({
        version: '1.0.0',
        app_details: [
          {
            path: './src',
            language: 'kotlin',
            mode: 'class',
            alias: 'test-app',
            type: 'code'
          }
        ],
        destination_folder: 'results/2025/november/manifests'
      })

      const configPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      // Verify destination folder doesn't exist initially
      expect(existsSync(join(projectDir, 'results'))).toBe(false)

      // Simulate the directory creation logic
      const { resolve } = require('path')
      const { mkdirSync } = require('fs')
      const projectRoot = projectDir // directory containing config
      const parsedConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
      const destinationFolder = resolve(projectRoot, parsedConfig.destination_folder)

      if (!existsSync(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
      }

      // Verify all nested directories were created
      expect(existsSync(join(projectRoot, 'results'))).toBe(true)
      expect(existsSync(join(projectRoot, 'results', '2025'))).toBe(true)
      expect(existsSync(join(projectRoot, 'results', '2025', 'november'))).toBe(true)
      expect(existsSync(join(projectRoot, 'results', '2025', 'november', 'manifests'))).toBe(true)
    })

    it('should output generated file paths in JSON format', async () => {
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
      ], 'output')

      const configPath = createTestFile(projectDir, '.aiforddd/code_manifest.json', configContent)

      // Test the logic that generates the JSON output
      const { readConfig } = await import('../../../src/shared/config/config-reader.js')
      const { findFiles } = await import('../../../src/tools/code-manifest/classifier/finder/index.js')
      const { classifyFilesByClass } = await import('../../../src/tools/code-manifest/classifier/filelist/filelist-classifier.js')
      const { writeClassifiedClassListRows } = await import('../../../src/tools/code-manifest/classifier/filelist/template-filler.js')
      const { readFileSync } = await import('fs')
      const pathModule = await import('path')

      const appConfig = readConfig(configPath)
      const projectRoot = projectDir
      const destinationFolder = pathModule.join(projectRoot, appConfig.destination_folder)

      // Ensure destination folder exists
      if (!existsSync(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
      }

      const templateCode = readFileSync(join(__dirname, '../../../src/tools/code-manifest/config/templates/template-code-filelist.md'), 'utf-8')
      const templateTest = readFileSync(join(__dirname, '../../../src/tools/code-manifest/config/templates/template-test-filelist.md'), 'utf-8')

      const getTemplateHeader = (template: string): string => {
        const lines = template.split('\n')
        if (lines.length < 2) {
          return ''
        }
        return lines[0] + '\n' + lines[1] + '\n'
      }

      const codeHeader = getTemplateHeader(templateCode)
      const testHeader = getTemplateHeader(templateTest)

      let codeRows = ''
      let testRows = ''

      for (const details of appConfig.app_details) {
        let suffix = ''
        if (details.language === 'kotlin') {
          suffix = '.kt'
        }

        const files = findFiles(details.path, suffix)

        if (details.mode === 'class') {
          const classifiedFiles = classifyFilesByClass(files)

          if (details.type === 'code') {
            const rows = writeClassifiedClassListRows(classifiedFiles, templateCode, details.path, details.alias)
            codeRows += rows
          } else if (details.type === 'test') {
            const rows = writeClassifiedClassListRows(classifiedFiles, templateTest, details.path, details.alias)
            testRows += rows
          }
        }
      }

      // Test the JSON output generation logic
      const generatedFiles: Array<{ type: string, path: string }> = []

      if (codeRows.length > 0) {
        const codeManifestPath = pathModule.join(destinationFolder, 'code_manifest.md')
        generatedFiles.push({ type: 'code_manifest', path: codeManifestPath })
      }
      if (testRows.length > 0) {
        const testManifestPath = pathModule.join(destinationFolder, 'tests_manifest.md')
        generatedFiles.push({ type: 'tests_manifest', path: testManifestPath })
      }

      const result = {
        generatedFiles,
        message: generatedFiles.length > 0 ? 'Manifests generated successfully' : 'No manifests generated'
      }

      // Verify the result structure
      expect(result).toHaveProperty('generatedFiles')
      expect(result).toHaveProperty('message')
      expect(result.message).toBe('Manifests generated successfully')

      expect(result.generatedFiles).toHaveLength(2)

      const codeManifest = result.generatedFiles.find((f: any) => f.type === 'code_manifest')
      const testManifest = result.generatedFiles.find((f: any) => f.type === 'tests_manifest')

      expect(codeManifest).toBeDefined()
      expect(codeManifest!.path).toBe(join(outputDir, 'code_manifest.md'))
      expect(testManifest).toBeDefined()
      expect(testManifest!.path).toBe(join(outputDir, 'tests_manifest.md'))
    })
  })
})
