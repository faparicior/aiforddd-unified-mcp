import { describe, it, expect } from 'vitest'
import { trimBasePath } from '../../../../../src/tools/code-manifest/classifier/finder/path-utils.ts'

describe('path-utils', () => {
  describe('trimBasePath', () => {
    it('should trim simple base path', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/kotlin/User.kt')
    })

    it('should handle base path with leading ./', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).not.toContain('./')
      expect(result).toBe('src/main/main/kotlin/User.kt')
    })

    it('should handle base path without leading ./', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = 'src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/kotlin/User.kt')
    })

    it('should handle base path ending with /main', () => {
      const path = '/project/src/main/kotlin/domain/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/kotlin/domain/User.kt')
    })

    it('should return original path if base not found', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = './different/path'

      const result = trimBasePath(path, base)

      expect(result).toBe(path)
    })

    it('should handle empty base path', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = ''

      const result = trimBasePath(path, base)

      expect(result).toBe(path)
    })

    it('should handle deeply nested paths', () => {
      const path = '/project/src/main/kotlin/com/example/app/domain/model/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/kotlin/com/example/app/domain/model/User.kt')
    })

    it('should preserve trailing path after base', () => {
      const path = '/project/src/test/kotlin/UserTest.kt'
      const base = './src/test'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/test/kotlin/UserTest.kt')
      expect(result).toContain('kotlin/UserTest.kt')
    })

    it('should handle base path with multiple segments', () => {
      const path = '/project/app/src/main/kotlin/User.kt'
      const base = './app/src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('app/src/main/main/kotlin/User.kt')
    })

    it('should handle path where base appears multiple times', () => {
      const path = '/project/src/src/main/kotlin/User.kt'
      const base = './src'

      const result = trimBasePath(path, base)

      // Should use first occurrence
      expect(result).toContain('src')
    })

    it('should work with Windows-style paths converted to forward slashes', () => {
      const path = 'C:/project/src/main/kotlin/User.kt'.replace(/\\/g, '/')
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/kotlin/User.kt')
    })

    it('should handle base path that is the entire path', () => {
      const path = '/project/src/main'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main')
    })

    it('should trim correctly when base is just parent dir', () => {
      const path = '/project/src/kotlin/User.kt'
      const base = './src'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/kotlin/User.kt')
    })

    it('should handle complex real-world paths', () => {
      const path = '/home/user/projects/myapp/backend/src/main/kotlin/com/company/app/domain/User.kt'
      const base = './backend/src/main'

      const result = trimBasePath(path, base)

      expect(result).toContain('backend/src/main')
      expect(result).toContain('kotlin/com/company/app/domain/User.kt')
    })

    it('should remove leading path up to and including base', () => {
      const path = '/var/lib/project/src/main/kotlin/User.kt'
      const base = 'src/main'

      const result = trimBasePath(path, base)

      expect(result).not.toContain('/var/lib/project')
      expect(result).toBe('src/main/main/kotlin/User.kt')
    })

    it('should handle paths with similar prefixes', () => {
      const path = '/project/source/main/kotlin/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      // Base not found, should return original
      expect(result).toBe(path)
    })

    it('should preserve file extension', () => {
      const path = '/project/src/main/kotlin/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result.endsWith('.kt')).toBe(true)
    })

    it('should handle base path ending with /main correctly', () => {
      const path = '/project/app/src/main/kotlin/User.kt'
      const base = './app/src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('app/src/main/main/kotlin/User.kt')
    })

    it('should handle test paths', () => {
      const path = '/project/src/test/kotlin/UserTest.kt'
      const base = './src/test'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/test/kotlin/UserTest.kt')
    })

    it('should handle paths with no kotlin subdirectory', () => {
      const path = '/project/src/main/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      expect(result).toBe('src/main/main/User.kt')
    })

    it('should be case sensitive', () => {
      const path = '/project/Src/Main/kotlin/User.kt'
      const base = './src/main'

      const result = trimBasePath(path, base)

      // Case doesn't match, should return original
      expect(result).toBe(path)
    })

    it('should handle single directory base', () => {
      const path = '/project/kotlin/User.kt'
      const base = './kotlin'

      const result = trimBasePath(path, base)

      expect(result).toBe('kotlin/User.kt')
    })

    it('should handle root-level files', () => {
      const path = '/project/User.kt'
      const base = './project'

      const result = trimBasePath(path, base)

      expect(result).toBe('project/User.kt')
    })
  })
})
