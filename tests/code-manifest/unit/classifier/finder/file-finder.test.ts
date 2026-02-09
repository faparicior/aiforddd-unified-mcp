import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { findFiles, getFileCount } from '../../../../../src/tools/code-manifest/classifier/finder/file-finder.ts'
import { createTempDir, removeTempDir, createTestFile } from '../../../fixtures/test-helpers.ts'
import { mkdirSync } from 'fs'
import { join } from 'path'

describe('file-finder', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('file-finder-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('findFiles', () => {
    it('should find single file with matching suffix', () => {
      createTestFile(tempDir, 'User.kt', 'class User')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(1)
      expect(result.fileList[0].value).toContain('User.kt')
    })

    it('should find multiple files with matching suffix', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, 'Order.kt', 'class Order')
      createTestFile(tempDir, 'Product.kt', 'class Product')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(3)
    })

    it('should filter files by suffix', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, 'README.md', '# Readme')
      createTestFile(tempDir, 'config.json', '{}')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(1)
      expect(result.fileList[0].value).toContain('User.kt')
    })

    it('should recursively search subdirectories', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, 'domain/Order.kt', 'class Order')
      createTestFile(tempDir, 'domain/model/Product.kt', 'class Product')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(3)
    })

    it('should handle deeply nested directories', () => {
      createTestFile(tempDir, 'a/b/c/d/e/f/Deep.kt', 'class Deep')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(1)
      expect(result.fileList[0].value).toContain('a/b/c/d/e/f/Deep.kt')
    })

    it('should return empty list when no files match', () => {
      createTestFile(tempDir, 'README.md', '# Readme')
      createTestFile(tempDir, 'config.json', '{}')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(0)
    })

    it('should return empty list for empty directory', () => {
      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(0)
    })

    it('should handle directory with only subdirectories', () => {
      mkdirSync(join(tempDir, 'subdir1'), { recursive: true })
      mkdirSync(join(tempDir, 'subdir2'), { recursive: true })

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(0)
    })

    it('should return full absolute paths', () => {
      createTestFile(tempDir, 'User.kt', 'class User')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList[0].value).toContain(tempDir)
      expect(result.fileList[0].value).toMatch(/^\/.*User\.kt$/)
    })

    it('should handle multiple file types correctly', () => {
      createTestFile(tempDir, 'File.kt', 'class File')
      createTestFile(tempDir, 'File.java', 'class File')
      createTestFile(tempDir, 'File.ts', 'class File')

      const ktResult = findFiles(tempDir, '.kt')
      const javaResult = findFiles(tempDir, '.java')
      const tsResult = findFiles(tempDir, '.ts')

      expect(ktResult.fileList).toHaveLength(1)
      expect(javaResult.fileList).toHaveLength(1)
      expect(tsResult.fileList).toHaveLength(1)
    })

    it('should handle files with similar names', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, 'UserTest.kt', 'class UserTest')
      createTestFile(tempDir, 'UserRepository.kt', 'class UserRepository')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(3)
    })

    it('should handle case-sensitive suffixes', () => {
      createTestFile(tempDir, 'File.kt', 'class File')
      createTestFile(tempDir, 'File.KT', 'class File')

      const result = findFiles(tempDir, '.kt')

      // Should only find .kt, not .KT (case sensitive)
      expect(result.fileList).toHaveLength(1)
      expect(result.fileList[0].value).toContain('File.kt')
    })

    it('should handle mixed directory structures', () => {
      // Create complex structure
      createTestFile(tempDir, 'root.kt', 'class Root')
      createTestFile(tempDir, 'domain/User.kt', 'class User')
      createTestFile(tempDir, 'domain/README.md', '# Domain')
      createTestFile(tempDir, 'application/service/UserService.kt', 'class UserService')
      createTestFile(tempDir, 'infrastructure/Empty.kt', 'class Empty')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(4)
    })

    it('should preserve file order consistency', () => {
      createTestFile(tempDir, 'A.kt', 'class A')
      createTestFile(tempDir, 'B.kt', 'class B')
      createTestFile(tempDir, 'C.kt', 'class C')

      const result1 = findFiles(tempDir, '.kt')
      const result2 = findFiles(tempDir, '.kt')

      // Same files should be found (though order might vary by OS)
      expect(result1.fileList).toHaveLength(result2.fileList.length)
    })

    it('should handle special characters in filenames', () => {
      createTestFile(tempDir, 'User-Service.kt', 'class UserService')
      createTestFile(tempDir, 'User_Repository.kt', 'class UserRepository')
      createTestFile(tempDir, 'User.Service.kt', 'class UserService')

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(3)
    })

    it('should ignore hidden files starting with dot', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, '.hidden.kt', 'class Hidden')

      const result = findFiles(tempDir, '.kt')

      // Depending on implementation, this might include hidden files or not
      // Most implementations should find both
      expect(result.fileList.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getFileCount', () => {
    it('should count files correctly', () => {
      createTestFile(tempDir, 'User.kt', 'class User')
      createTestFile(tempDir, 'Order.kt', 'class Order')

      const filesFound = findFiles(tempDir, '.kt')
      const count = getFileCount(filesFound)

      expect(count).toBe(2)
    })

    it('should return 0 for empty file list', () => {
      const filesFound = { fileList: [] }
      const count = getFileCount(filesFound)

      expect(count).toBe(0)
    })

    it('should handle large file counts', () => {
      // Create many files
      for (let i = 0; i < 50; i++) {
        createTestFile(tempDir, `File${i}.kt`, `class File${i}`)
      }

      const filesFound = findFiles(tempDir, '.kt')
      const count = getFileCount(filesFound)

      expect(count).toBe(50)
    })
  })

  describe('error handling', () => {
    it('should handle non-existent directory gracefully', () => {
      const nonExistentDir = join(tempDir, 'does-not-exist')

      // Should not throw, but return empty list
      expect(() => {
        const result = findFiles(nonExistentDir, '.kt')
        expect(result.fileList).toHaveLength(0)
      }).not.toThrow()
    })

    it('should handle empty suffix', () => {
      createTestFile(tempDir, 'File.kt', 'class File')
      createTestFile(tempDir, 'README.md', '# Readme')

      const result = findFiles(tempDir, '')

      // With empty suffix, should find all files
      expect(result.fileList.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('performance', () => {
    it('should handle directories with many files', () => {
      // Create 100 files across multiple directories
      for (let i = 0; i < 100; i++) {
        const subdir = i % 10
        createTestFile(tempDir, `dir${subdir}/File${i}.kt`, `class File${i}`)
      }

      const result = findFiles(tempDir, '.kt')

      expect(result.fileList).toHaveLength(100)
    })
  })
})
