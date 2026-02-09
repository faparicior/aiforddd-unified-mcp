import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeClassifiedClassListRows } from '../../../../../src/tools/code-manifest/classifier/filelist/template-filler.ts'
import { createTempDir, removeTempDir, createKotlinTestFile } from '../../../fixtures/test-helpers.ts'
import { classifyFilesByClass } from '../../../../../src/tools/code-manifest/classifier/filelist/filelist-classifier.ts'
import { readFileSync } from 'fs'

describe('template-filler', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('template-filler-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  const standardTemplate = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| {{Status}} | {{Identifier}} | {{Content}} | {{Alias}} | {{Catalogued}} | {{Processed}} | {{Class}} | {{File}} | {{Type}} | {{Layer}} | {{Description}} |`

  describe('writeClassifiedClassListRows', () => {
    it('should generate rows from classified files', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      expect(result).toBeTruthy()
      expect(result).toContain('User')
      expect(result).toContain('test-app')
    })

    it('should replace {{Alias}} placeholder', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'my-app'
      )

      expect(result).toContain('my-app')
      expect(result).not.toContain('{{Alias}}')
    })

    it('should replace {{Class}} placeholder with class name', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'UserService.kt',
        'com.example.app.application',
        'UserService',
        { classType: 'class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      expect(result).toContain('UserService')
      expect(result).not.toContain('{{Class}}')
    })

    it('should replace {{File}} placeholder with relative path', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'domain/User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      expect(result).toContain('domain/User.kt')
    })

    it('should generate unique identifier for each class', () => {
      const file1 = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const file2 = createKotlinTestFile(
        tempDir,
        'Order.kt',
        'com.example.app.domain',
        'Order',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: file1 }, { value: file2 }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      const lines = result.split('\n').filter(l => l.trim())
      expect(lines.length).toBeGreaterThanOrEqual(2)

      // Extract identifiers (second column)
      const identifiers = lines.map(line => {
        const match = line.match(/\|\s*\|\s*([a-f0-9]+)\s*\|/)
        return match ? match[1] : null
      }).filter(id => id && id.length === 12)

      expect(identifiers.length).toBe(2)
      expect(identifiers[0]).not.toBe(identifiers[1])
    })

    it('should generate content hash from file content', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      // Content hash should be a hex string (third column)
      const match = result.match(/\|\s*\|\s*[a-f0-9]+\s*\|\s*([a-f0-9]{40})\s*\|/)
      expect(match).toBeTruthy()
      expect(match![1]).toHaveLength(40) // SHA1 hash length
    })

    it('should handle multiple files in batch', () => {
      const files = []
      for (let i = 1; i <= 5; i++) {
        files.push(createKotlinTestFile(
          tempDir,
          `Class${i}.kt`,
          'com.example.app.domain',
          `Class${i}`,
          { classType: 'class' }
        ))
      }

      const filesFound = { fileList: files.map(f => ({ value: f })) }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      const lines = result.split('\n').filter(l => l.trim())
      expect(lines.length).toBe(5)
    })

    it('should preserve template variables not meant to be replaced', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      // These should remain as template variables for later processing
      expect(result).toContain('{{Type}}')
      expect(result).toContain('{{Layer}}')
      expect(result).toContain('{{Description}}')
    })

    it('should set Status field to empty', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      // First column (Status) should be empty
      const lines = result.split('\n').filter(l => l.trim())
      expect(lines[0]).toMatch(/^\|\s*\|/)
    })

    it('should handle empty template gracefully', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        'Header\nSeparator',
        tempDir,
        'test-app'
      )

      expect(result).toBe('')
    })

    it('should handle files with no classes', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'Empty.kt',
        'com.example.app',
        '',
        { classType: '' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      // Should generate a row with empty class name
      expect(result).toBeTruthy()
    })

    it('should generate consistent identifier for same file', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const result1 = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      const result2 = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        tempDir,
        'test-app'
      )

      // Identifiers should be the same for same file/class
      expect(result1).toBe(result2)
    })

    it('should trim base path correctly', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'src/main/kotlin/User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = { fileList: [{ value: filePath }] }
      const classifiedFiles = classifyFilesByClass(filesFound)

      const basePath = `${tempDir}/src/main`

      const result = writeClassifiedClassListRows(
        classifiedFiles,
        standardTemplate,
        basePath,
        'test-app'
      )

      expect(result).toContain('kotlin/User.kt')
      expect(result).toContain(tempDir)
    })
  })
})
