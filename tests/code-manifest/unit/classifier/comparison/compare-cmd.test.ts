import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CompareCommand } from '../../../../../src/tools/code-manifest/classifier/comparison/compare-cmd.ts'
import { createTempDir, removeTempDir, createTestFile, createTestMarkdownTable } from '../../../fixtures/test-helpers.ts'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

describe('compare-cmd', () => {
  let tempDir: string
  let compareCmd: CompareCommand

  beforeEach(() => {
    tempDir = createTempDir('compare-cmd-')
    compareCmd = new CompareCommand()
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('CompareCommand', () => {
    it('should create instance successfully', () => {
      expect(compareCmd).toBeDefined()
      expect(compareCmd).toBeInstanceOf(CompareCommand)
    })

    describe('createBackup', () => {
      it('should create backup file with .backup extension', () => {
        const originalContent = createTestMarkdownTable([
          {
            identifier: 'abc123',
            contentHash: 'hash123',
            alias: 'app1',
            class: 'User',
            file: 'User.kt'
          }
        ])

        const originalFile = createTestFile(tempDir, 'classes.md', originalContent)
        
        compareCmd.createBackup(originalFile)

        const backupPath = `${originalFile}.backup`
        expect(existsSync(backupPath)).toBe(true)
      })

      it('should backup file content exactly', () => {
        const originalContent = createTestMarkdownTable([
          {
            identifier: 'abc123',
            contentHash: 'hash123',
            alias: 'app1',
            class: 'User',
            file: 'User.kt'
          }
        ])

        const originalFile = createTestFile(tempDir, 'classes.md', originalContent)
        
        compareCmd.createBackup(originalFile)

        const backupPath = `${originalFile}.backup`
        const backupContent = readFileSync(backupPath, 'utf-8')
        
        expect(backupContent).toBe(originalContent)
      })

      it('should overwrite existing backup', () => {
        const content1 = createTestMarkdownTable([
          { identifier: 'id1', contentHash: 'hash1', alias: 'app1', class: 'Class1', file: 'file1.kt' }
        ])
        const content2 = createTestMarkdownTable([
          { identifier: 'id2', contentHash: 'hash2', alias: 'app1', class: 'Class2', file: 'file2.kt' }
        ])

        const originalFile = createTestFile(tempDir, 'classes.md', content1)
        
        compareCmd.createBackup(originalFile)
        
        // Modify original and backup again
        createTestFile(tempDir, 'classes.md', content2)
        compareCmd.createBackup(originalFile)

        const backupPath = `${originalFile}.backup`
        const backupContent = readFileSync(backupPath, 'utf-8')
        
        expect(backupContent).toBe(content2)
        expect(backupContent).not.toBe(content1)
      })
    })

    describe('compareFiles', () => {
      it('should compare two markdown files without errors', () => {
        const oldContent = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash1', alias: 'app1', class: 'User', file: 'User.kt' }
        ])
        const newContent = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash2', alias: 'app1', class: 'User', file: 'User.kt' }
        ])

        const oldFile = createTestFile(tempDir, 'old.md', oldContent)
        const newFile = createTestFile(tempDir, 'new.md', newContent)

        // Should not throw
        expect(() => {
          compareCmd.compareFiles(oldFile, newFile)
        }).not.toThrow()
      })

      it('should handle files with different entry counts', () => {
        const oldContent = createTestMarkdownTable([
          { identifier: 'id1', contentHash: 'hash1', alias: 'app1', class: 'Class1', file: 'file1.kt' }
        ])
        const newContent = createTestMarkdownTable([
          { identifier: 'id1', contentHash: 'hash1', alias: 'app1', class: 'Class1', file: 'file1.kt' },
          { identifier: 'id2', contentHash: 'hash2', alias: 'app1', class: 'Class2', file: 'file2.kt' }
        ])

        const oldFile = createTestFile(tempDir, 'old.md', oldContent)
        const newFile = createTestFile(tempDir, 'new.md', newContent)

        expect(() => {
          compareCmd.compareFiles(oldFile, newFile)
        }).not.toThrow()
      })

      it('should handle empty files', () => {
        const emptyTable = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
`

        const oldFile = createTestFile(tempDir, 'empty-old.md', emptyTable)
        const newFile = createTestFile(tempDir, 'empty-new.md', emptyTable)

        expect(() => {
          compareCmd.compareFiles(oldFile, newFile)
        }).not.toThrow()
      })
    })

    describe('compareWithRepository', () => {
      it('should handle missing backup file gracefully', () => {
        const content = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash123', alias: 'app1', class: 'User', file: 'User.kt' }
        ])

        const currentFile = createTestFile(tempDir, 'current.md', content)

        // Should not throw when backup doesn't exist
        expect(() => {
          compareCmd.compareWithRepository(currentFile)
        }).not.toThrow()
      })

      it('should compare with backup when it exists', () => {
        const oldContent = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash1', alias: 'app1', class: 'User', file: 'User.kt' }
        ])
        const newContent = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash2', alias: 'app1', class: 'User', file: 'User.kt' }
        ])

        const currentFile = createTestFile(tempDir, 'current.md', oldContent)
        compareCmd.createBackup(currentFile)
        
        // Update current file
        createTestFile(tempDir, 'current.md', newContent)

        // Should compare without throwing
        expect(() => {
          compareCmd.compareWithRepository(currentFile)
        }).not.toThrow()
      })

      it('should use correct backup path convention', () => {
        const content = createTestMarkdownTable([
          { identifier: 'abc123', contentHash: 'hash123', alias: 'app1', class: 'User', file: 'User.kt' }
        ])

        const currentFile = createTestFile(tempDir, 'test.md', content)
        compareCmd.createBackup(currentFile)

        const expectedBackupPath = `${currentFile}.backup`
        expect(existsSync(expectedBackupPath)).toBe(true)
      })
    })

    describe('integration scenarios', () => {
      it('should handle complete backup and compare workflow', () => {
        // Step 1: Create initial file
        const initialContent = createTestMarkdownTable([
          { identifier: 'id1', contentHash: 'hash1', alias: 'app1', class: 'User', file: 'User.kt' },
          { identifier: 'id2', contentHash: 'hash2', alias: 'app1', class: 'Order', file: 'Order.kt' }
        ])
        const file = createTestFile(tempDir, 'manifest.md', initialContent)

        // Step 2: Create backup
        compareCmd.createBackup(file)
        expect(existsSync(`${file}.backup`)).toBe(true)

        // Step 3: Modify file
        const updatedContent = createTestMarkdownTable([
          { identifier: 'id1', contentHash: 'hash1_modified', alias: 'app1', class: 'User', file: 'User.kt' },
          { identifier: 'id2', contentHash: 'hash2', alias: 'app1', class: 'Order', file: 'Order.kt' },
          { identifier: 'id3', contentHash: 'hash3', alias: 'app1', class: 'Product', file: 'Product.kt' }
        ])
        createTestFile(tempDir, 'manifest.md', updatedContent)

        // Step 4: Compare with repository
        expect(() => {
          compareCmd.compareWithRepository(file)
        }).not.toThrow()
      })
    })
  })
})
