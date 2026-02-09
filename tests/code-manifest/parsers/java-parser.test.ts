import { describe, it, expect, beforeEach } from 'vitest'
import { join } from 'path'
import { JavaParser } from '../../../src/tools/code-manifest/classifier/parsers/java-parser.ts'
import { ParsedFile } from '../../../src/tools/code-manifest/classifier/parsers/interfaces.ts'

describe('JavaParser - Parity Features', () => {
  let parser: JavaParser
  let parsedFile: ParsedFile

  beforeEach(() => {
    parser = new JavaParser()
    const filePath = join(process.cwd(), 'tests', 'code-manifest', 'fixtures', 'java-parity.java')
    parsedFile = parser.parse(filePath)
  })

  describe('Annotations', () => {
    it('should extract class annotations', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      expect(cls?.annotations).toContain('@ClassAnnotation')
    })

    it('should extract field annotations', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const prop = cls?.properties.find(p => p.name === 'readonlyField')
      expect(prop?.annotations).toContain('@FieldAnnotation')
    })

    it('should extract method annotations', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'interfaceMethod')
      expect(func?.annotations).toContain('@MethodAnnotation')
    })
  })

  describe('Mutability', () => {
    it('should identify readonly (final) fields', () => {
        const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
        const prop = cls?.properties.find(p => p.name === 'readonlyField')
        expect(prop?.metadata?.readonly).toBe(true)
        expect(prop?.metadata?.mutability).toBe('readonly')
    })

    it('should identify mutable (non-final) fields', () => {
        const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
        const prop = cls?.properties.find(p => p.name === 'mutableField')
        expect(prop?.metadata?.readonly).toBe(false)
        expect(prop?.metadata?.mutability).toBe('mutable')
    })
  })

  describe('Overrides', () => {
    it('should identify override methods', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'interfaceMethod')
      expect(func?.isOverride).toBe(true)
    })

    it('should identify non-override methods', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'normalMethod')
      expect(func?.isOverride).toBe(false)
    })
  })

  describe('Constants', () => {
      it('should extract static final fields as constants', () => {
          const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
          
          const strConst = cls?.constants.find(x => x.name === 'CONSTANT_STRING')
          expect(strConst?.value).toContain('"constant"')
          expect(strConst?.visibility).toBe('public')

          const intConst = cls?.constants.find(x => x.name === 'CONSTANT_INT')
          expect(intConst?.value).toBe('100')
      })
  })
})
