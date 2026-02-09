import { describe, it, expect, beforeEach } from 'vitest'
import { MarkdownParser, HashComparer, Status } from '../../../../../src/tools/code-manifest/classifier/comparison/hash-comparer.ts'
import { mockOldClassEntries, mockNewClassEntries, sampleMarkdownTable, sampleExtendedMarkdownTable } from '../../../fixtures/mock-data.ts'

describe('hash-comparer', () => {
  describe('MarkdownParser', () => {
    let parser: MarkdownParser

    beforeEach(() => {
      parser = new MarkdownParser()
    })

    it('should parse valid markdown table', () => {
      const entries = parser.parseMarkdownTable(sampleMarkdownTable)

      expect(entries).toHaveLength(2)
      expect(entries[0].identifier).toBe('abc123def456')
      expect(entries[0].class).toBe('User')
      expect(entries[0].file).toBe('src/domain/User.kt')
    })

    it('should skip header and separator lines', () => {
      const entries = parser.parseMarkdownTable(sampleMarkdownTable)

      expect(entries.every(e => e.class !== 'Class')).toBe(true)
      expect(entries.every(e => !e.identifier.includes('---'))).toBe(true)
    })

    it('should parse all columns correctly', () => {
      const entry = parser.parseMarkdownTable(sampleMarkdownTable)[0]

      expect(entry.status).toBe('')
      expect(entry.identifier).toBe('abc123def456')
      expect(entry.contentHash).toBe('hash1234567890abcdef')
      expect(entry.alias).toBe('app1')
      expect(entry.catalogued).toBe('2024-01-01')
      expect(entry.processed).toBe('2024-01-01')
      expect(entry.class).toBe('User')
      expect(entry.file).toBe('src/domain/User.kt')
      expect(entry.type).toBe('Entity')
      expect(entry.layer).toBe('Domain')
      expect(entry.description).toBe('User entity')
    })

    it('should handle empty lines gracefully', () => {
      const tableWithEmptyLines = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|

| | abc123 | hash123 | app1 | | | User | file.kt | Type | Layer | Desc |

`
      const entries = parser.parseMarkdownTable(tableWithEmptyLines)

      expect(entries).toHaveLength(1)
    })

    it('should trim whitespace from fields', () => {
      const tableWithSpaces = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
|   |  abc123  |  hash123  |  app1  |  |  |  User  |  file.kt  |  Type  |  Layer  |  Desc  |`
      
      const entries = parser.parseMarkdownTable(tableWithSpaces)
      const entry = entries[0]

      expect(entry.identifier).toBe('abc123')
      expect(entry.contentHash).toBe('hash123')
      expect(entry.class).toBe('User')
    })

    it('should handle tables without status column (old format)', () => {
      const oldFormatTable = `| Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
| abc123 | hash123 | app1 | | | User | file.kt | Type | Layer | Desc |`
      
      const entries = parser.parseMarkdownTable(oldFormatTable)

      expect(entries).toHaveLength(1)
      expect(entries[0].identifier).toBeDefined()
      expect(entries[0].class).toBe('User')
    })

    it('should handle tables with extended columns (more than 11)', () => {
      const entries = parser.parseMarkdownTable(sampleExtendedMarkdownTable)

      expect(entries).toHaveLength(2)
      expect(entries[0].identifier).toBe('abc123def456')
      expect(entries[0].class).toBe('User')
      expect(entries[0].file).toBe('src/domain/User.kt')
      expect(entries[0].layer).toBe('Domain')
      expect(entries[0].type).toBe('Entity')
      expect(entries[0].description).toBe('User entity')
    })
  })

  describe('HashComparer', () => {
    let comparer: HashComparer

    beforeEach(() => {
      comparer = new HashComparer()
    })

    it('should identify new classes', () => {
      const result = comparer.compare(mockOldClassEntries, mockNewClassEntries)

      expect(result.newClasses).toHaveLength(1)
      expect(result.newClasses[0].identifier).toBe('new333new444')
      expect(result.newClasses[0].class).toBe('NewClass')
    })

    it('should identify deleted classes', () => {
      const result = comparer.compare(mockOldClassEntries, mockNewClassEntries)

      expect(result.deletedClasses).toHaveLength(1)
      expect(result.deletedClasses[0].identifier).toBe('old111old222')
      expect(result.deletedClasses[0].class).toBe('OldClass')
    })

    it('should identify changed classes by content hash', () => {
      const result = comparer.compare(mockOldClassEntries, mockNewClassEntries)

      expect(result.changedClasses).toHaveLength(1)
      expect(result.changedClasses[0].identifier).toBe('xyz789ghi012')
      expect(result.changedClasses[0].class).toBe('UserService')
      expect(result.changedClasses[0].oldContentHash).toBe('hash0987654321fedcba')
      expect(result.changedClasses[0].newContentHash).toBe('hashNEWNEWNEWNEWNEW')
    })

    it('should count unchanged classes', () => {
      const result = comparer.compare(mockOldClassEntries, mockNewClassEntries)

      expect(result.unchangedCount).toBe(1)
    })

    it('should handle empty old entries', () => {
      const result = comparer.compare([], mockNewClassEntries)

      expect(result.newClasses).toHaveLength(mockNewClassEntries.length)
      expect(result.deletedClasses).toHaveLength(0)
      expect(result.changedClasses).toHaveLength(0)
      expect(result.unchangedCount).toBe(0)
    })

    it('should handle empty new entries', () => {
      const result = comparer.compare(mockOldClassEntries, [])

      expect(result.newClasses).toHaveLength(0)
      expect(result.deletedClasses).toHaveLength(mockOldClassEntries.length)
      expect(result.changedClasses).toHaveLength(0)
      expect(result.unchangedCount).toBe(0)
    })

    it('should handle identical sets', () => {
      const result = comparer.compare(mockOldClassEntries, mockOldClassEntries)

      expect(result.newClasses).toHaveLength(0)
      expect(result.deletedClasses).toHaveLength(0)
      expect(result.changedClasses).toHaveLength(0)
      expect(result.unchangedCount).toBe(mockOldClassEntries.length)
    })

    it('should use identifier for matching, not file path', () => {
      const oldEntries = [{
        status: '',
        identifier: 'id123',
        contentHash: 'hash1',
        alias: 'app1',
        catalogued: '',
        processed: '',
        class: 'User',
        file: 'old/path/User.kt',
        type: 'Entity',
        layer: 'Domain',
        description: ''
      }]

      const newEntries = [{
        status: '',
        identifier: 'id123',
        contentHash: 'hash1',
        alias: 'app1',
        catalogued: '',
        processed: '',
        class: 'User',
        file: 'new/path/User.kt',
        type: 'Entity',
        layer: 'Domain',
        description: ''
      }]

      const result = comparer.compare(oldEntries, newEntries)

      expect(result.unchangedCount).toBe(1)
      expect(result.newClasses).toHaveLength(0)
      expect(result.deletedClasses).toHaveLength(0)
    })

    describe('formatAsMarkdown', () => {
      it('should format entries with basic header', () => {
        const basicHeader = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|`
        
        const result = comparer.formatAsMarkdown(mockOldClassEntries.slice(0, 1), basicHeader)
        
        expect(result).toContain('| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |')
        expect(result).toContain('| abc123def456 | hash1234567890abcdef | app1 | 2024-01-01 | 2024-01-01 | User | src/domain/User.kt | Entity | Domain | User entity |')
      })

      it('should format entries with extended header (more columns)', () => {
        const extendedHeader = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Layer | Category | Description | Integration Rules | Validation Rules | Invariants | Business rules | Factory/Creation | Transformations | Identity Management | Lifecycle Management | Domain Events | Aggregate Consistency | External Dependencies | Event Mapping | Error Handling | Idempotency | Side Effects | Transaction Management |
|--------|------------|---------|-------|------------|-----------|-------|------|-------|----------|-------------|-------------------|------------------|------------|----------------|------------------|-----------------|---------------------|----------------------|---------------|-----------------------|-----------------------|---------------|----------------|-------------|--------------|------------------------|`
        
        const result = comparer.formatAsMarkdown(mockOldClassEntries.slice(0, 1), extendedHeader)
        
        expect(result).toContain('| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Layer | Category | Description | Integration Rules | Validation Rules | Invariants | Business rules | Factory/Creation | Transformations | Identity Management | Lifecycle Management | Domain Events | Aggregate Consistency | External Dependencies | Event Mapping | Error Handling | Idempotency | Side Effects | Transaction Management |')
        // The row should have the basic fields followed by empty cells for the additional columns
        expect(result).toContain('|  | abc123def456 | hash1234567890abcdef | app1 | 2024-01-01 | 2024-01-01 | User | src/domain/User.kt | Entity | Domain | User entity |')
        expect(result).toMatch(/\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*\|\s*$/)
      })

      it('should throw error for invalid header', () => {
        const invalidHeader = 'Invalid header without pipes'
        
        expect(() => comparer.formatAsMarkdown(mockOldClassEntries.slice(0, 1), invalidHeader)).toThrow('Invalid header: expected at least 2 table lines starting with |')
      })
    })
  })

  describe('Status constants', () => {
    it('should have correct status values', () => {
      expect(Status.NEW).toBe('NEW')
      expect(Status.CHANGED).toBe('CHANGED')
      expect(Status.DELETED).toBe('DELETED')
      expect(Status.MOVED).toBe('MOVED')
      expect(Status.RENAMED).toBe('RENAMED')
      expect(Status.UNCHANGED).toBe('')
    })
  })
})
