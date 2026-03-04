import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTempDir, removeTempDir, createTestFile, createKotlinTestFile, createTestConfig, createTestMarkdownTable } from '../fixtures/test-helpers.ts'
import { readConfig } from '../../../src/shared/config/config-reader.ts'
import { findFiles } from '../../../src/tools/code-manifest/classifier/finder/file-finder.ts'
import { classifyFilesByClass } from '../../../src/tools/code-manifest/classifier/filelist/filelist-classifier.ts'
import { writeClassifiedClassListRows } from '../../../src/tools/code-manifest/classifier/filelist/template-filler.ts'
import { MarkdownParser, HashComparer } from '../../../src/tools/code-manifest/classifier/comparison/hash-comparer.ts'
import { CompareCommand } from '../../../src/tools/code-manifest/classifier/comparison/compare-cmd.ts'
import { join } from 'path'
import { readFileSync } from 'fs'

describe('Full Workflow Integration Tests', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('integration-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('End-to-End Workflow', () => {
    it('should execute complete classification workflow', () => {
      // Step 1: Create project structure
      const projectDir = join(tempDir, 'project')

      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/domain/User.kt',
        'com.example.app.domain',
        'User',
        {
          classType: 'data class',
          properties: [
            { name: 'id', type: 'UUID', mutability: 'val' },
            { name: 'name', type: 'String', mutability: 'val' }
          ]
        }
      )

      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/domain/Order.kt',
        'com.example.app.domain',
        'Order',
        {
          classType: 'data class',
          properties: [
            { name: 'id', type: 'UUID', mutability: 'val' }
          ]
        }
      )

      // Step 2: Create config
      const configContent = createTestConfig([
        {
          path: join(projectDir, 'src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'test-app',
          type: 'code'
        }
      ])
      const configPath = createTestFile(projectDir, 'config.json', configContent)

      // Step 3: Read config
      const config = readConfig(configPath)
      expect(config.app_details).toHaveLength(1)

      // Step 4: Find files
      const files = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      expect(files.fileList).toHaveLength(2)

      // Step 5: Classify files
      const classifiedFiles = classifyFilesByClass(files)
      expect(classifiedFiles).toHaveLength(2)

      // Step 6: Generate markdown rows
      const template = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const rows = writeClassifiedClassListRows(
        classifiedFiles,
        template,
        join(projectDir, 'src/main'),
        'test-app'
      )

      expect(rows).toContain('User')
      expect(rows).toContain('Order')
      expect(rows).toContain('test-app')
    })

    it('should handle code and test files separately', () => {
      const projectDir = join(tempDir, 'project')

      // Create code files
      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/User.kt',
        'com.example.app',
        'User',
        { classType: 'data class' }
      )

      // Create test files
      createKotlinTestFile(
        projectDir,
        'src/test/kotlin/UserTest.kt',
        'com.example.app',
        'UserTest',
        { classType: 'class' }
      )

      // Find and classify code files
      const codeFiles = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classifiedCode = classifyFilesByClass(codeFiles)
      expect(classifiedCode).toHaveLength(1)
      expect(classifiedCode[0].classSpecsFound.classes[0].name).toBe('User')

      // Find and classify test files
      const testFiles = findFiles(join(projectDir, 'src/test/kotlin'), '.kt')
      const classifiedTest = classifyFilesByClass(testFiles)
      expect(classifiedTest).toHaveLength(1)
      expect(classifiedTest[0].classSpecsFound.classes[0].name).toBe('UserTest')
    })

    it('should generate markdown and compare versions', () => {
      const projectDir = join(tempDir, 'project')

      // Create initial files
      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/User.kt',
        'com.example.app',
        'User',
        { classType: 'data class' }
      )

      const template = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      // Generate initial markdown
      const files1 = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classified1 = classifyFilesByClass(files1)
      const header = template.split('\n').slice(0, 2).join('\n') + '\n'
      const rows1 = writeClassifiedClassListRows(classified1, template, projectDir, 'app')
      const markdown1 = header + rows1

      const oldFile = createTestFile(projectDir, 'classes-old.md', markdown1)

      // Add new file
      createKotlinTestFile(
        projectDir,
        'src/main/kotlin/Order.kt',
        'com.example.app',
        'Order',
        { classType: 'data class' }
      )

      // Generate new markdown
      const files2 = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classified2 = classifyFilesByClass(files2)
      const rows2 = writeClassifiedClassListRows(classified2, template, projectDir, 'app')
      const markdown2 = header + rows2

      const newFile = createTestFile(projectDir, 'classes-new.md', markdown2)

      // Compare
      const parser = new MarkdownParser()
      const comparer = new HashComparer()

      const oldEntries = parser.parseMarkdownTable(readFileSync(oldFile, 'utf-8'))
      const newEntries = parser.parseMarkdownTable(readFileSync(newFile, 'utf-8'))

      const result = comparer.compare(oldEntries, newEntries)

      expect(result.newClasses).toHaveLength(1)
      expect(result.unchangedCount).toBe(1)
    })
  })

  describe('Configuration-Driven Workflow', () => {
    it('should process multiple paths from config', () => {
      const projectDir = join(tempDir, 'multi-project')

      // Create files in different locations
      createKotlinTestFile(
        projectDir,
        'app1/src/main/kotlin/User.kt',
        'com.app1',
        'User',
        { classType: 'data class' }
      )

      createKotlinTestFile(
        projectDir,
        'app2/src/main/kotlin/Product.kt',
        'com.app2',
        'Product',
        { classType: 'data class' }
      )

      // Create config for both
      const configContent = createTestConfig([
        {
          path: join(projectDir, 'app1/src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'app1',
          type: 'code'
        },
        {
          path: join(projectDir, 'app2/src/main/kotlin'),
          language: 'kotlin',
          mode: 'class',
          alias: 'app2',
          type: 'code'
        }
      ])

      const configPath = createTestFile(projectDir, 'config.json', configContent)
      const config = readConfig(configPath)

      expect(config.app_details).toHaveLength(2)

      // Process each app
      const template = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      let allRows = ''
      for (const detail of config.app_details) {
        const files = findFiles(detail.path, '.kt')
        const classified = classifyFilesByClass(files)
        const rows = writeClassifiedClassListRows(classified, template, detail.path, detail.alias)
        allRows += rows
      }

      expect(allRows).toContain('app1')
      expect(allRows).toContain('app2')
      expect(allRows).toContain('User')
      expect(allRows).toContain('Product')
    })
  })

  describe('Comparison Workflow', () => {
    it('should detect changed files in workflow', () => {
      const projectDir = join(tempDir, 'compare-project')

      // Create initial file
      const file1 = createKotlinTestFile(
        projectDir,
        'src/main/kotlin/User.kt',
        'com.example.app',
        'User',
        {
          classType: 'data class',
          properties: [{ name: 'id', type: 'UUID', mutability: 'val' }]
        }
      )

      // Generate initial manifest
      const template = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const files1 = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classified1 = classifyFilesByClass(files1)
      const header = template.split('\n').slice(0, 2).join('\n') + '\n'
      const rows1 = writeClassifiedClassListRows(classified1, template, projectDir, 'app')
      const manifest1 = header + rows1

      const manifestPath = createTestFile(projectDir, 'manifest.md', manifest1)

      // Create backup
      const compareCmd = new CompareCommand()
      compareCmd.createBackup(manifestPath)

      // Modify file (add property)
      const file2 = createKotlinTestFile(
        projectDir,
        'src/main/kotlin/User.kt',
        'com.example.app',
        'User',
        {
          classType: 'data class',
          properties: [
            { name: 'id', type: 'UUID', mutability: 'val' },
            { name: 'name', type: 'String', mutability: 'val' }
          ]
        }
      )

      // Generate new manifest
      const files2 = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classified2 = classifyFilesByClass(files2)
      const rows2 = writeClassifiedClassListRows(classified2, template, projectDir, 'app')
      const manifest2 = header + rows2

      createTestFile(projectDir, 'manifest.md', manifest2)

      // Compare should work without errors
      expect(() => {
        compareCmd.compareWithRepository(manifestPath)
      }).not.toThrow()
    })
  })

  describe('Error Handling in Workflow', () => {
    it('should handle empty directories gracefully', () => {
      const projectDir = join(tempDir, 'empty-project')
      const emptyDir = join(projectDir, 'src/main/kotlin')

      const files = findFiles(emptyDir, '.kt')
      expect(files.fileList).toHaveLength(0)

      const classified = classifyFilesByClass(files)
      expect(classified).toHaveLength(0)
    })

    it('should handle invalid config gracefully', () => {
      const projectDir = join(tempDir, 'invalid-config')
      const configPath = createTestFile(projectDir, 'config.json', 'invalid json')

      expect(() => readConfig(configPath)).toThrow('Invalid JSON in configuration file')
    })

    it('should handle files with no classes', () => {
      const projectDir = join(tempDir, 'no-classes')

      // Create empty Kotlin file
      createTestFile(projectDir, 'src/main/kotlin/Empty.kt', 'package com.example.app\n\n// Empty file')

      const files = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      const classified = classifyFilesByClass(files)

      expect(classified).toHaveLength(1)
      expect(classified[0].classSpecsFound.classes).toHaveLength(0)
    })
  })

  describe('Performance and Scale', () => {
    it('should handle multiple files efficiently', () => {
      const projectDir = join(tempDir, 'large-project')

      // Create 20 files
      for (let i = 1; i <= 20; i++) {
        createKotlinTestFile(
          projectDir,
          `src/main/kotlin/Class${i}.kt`,
          'com.example.app',
          `Class${i}`,
          { classType: 'data class' }
        )
      }

      const files = findFiles(join(projectDir, 'src/main/kotlin'), '.kt')
      expect(files.fileList).toHaveLength(20)

      const classified = classifyFilesByClass(files)
      expect(classified).toHaveLength(20)

      const template = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

      const rows = writeClassifiedClassListRows(classified, template, projectDir, 'app')
      const rowCount = rows.split('\n').filter(r => r.trim()).length

      expect(rowCount).toBe(20)
    })
  })
})
