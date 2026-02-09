import { describe, it, expect, beforeEach } from 'vitest'
import { join } from 'path'
import { KotlinParser } from '../../../src/tools/code-manifest/classifier/parsers/kotlin-parser.ts'
import { ParsedFile } from '../../../src/tools/code-manifest/classifier/parsers/interfaces.ts'

describe('KotlinParser - Parity Features', () => {
  let parser: KotlinParser
  let parsedFile: ParsedFile

  beforeEach(() => {
    parser = new KotlinParser()
    const filePath = join(process.cwd(), 'tests', 'code-manifest', 'fixtures', 'kotlin-parity.kt')
    parsedFile = parser.parse(filePath)
  })

  describe('Mutability', () => {
    it('should correctly identify val and var in constructor parameters', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      expect(cls).toBeDefined()
      
      const valParam = cls?.properties.find(p => p.name === 'constructorVal')
      expect(valParam?.metadata?.mutability).toBe('val')
      expect(valParam?.metadata?.readonly).toBe(true)

      const varParam = cls?.properties.find(p => p.name === 'constructorVar')
      expect(varParam?.metadata?.mutability).toBe('var')
      expect(varParam?.metadata?.readonly).toBe(false)
    })

    it('should correctly identify val and var in class properties', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      
      const valProp = cls?.properties.find(p => p.name === 'classVal')
      expect(valProp?.metadata?.mutability).toBe('val')
      expect(valProp?.metadata?.readonly).toBe(true)

      const varProp = cls?.properties.find(p => p.name === 'classVar')
      expect(varProp?.metadata?.mutability).toBe('var')
      expect(varProp?.metadata?.readonly).toBe(false)
    })
  })

  describe('Overrides', () => {
    it('should correctly identify override functions', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      
      const overrideFunc = cls?.functions.find(f => f.name === 'interfaceMethod')
      expect(overrideFunc?.isOverride).toBe(true)

      const normalFunc = cls?.functions.find(f => f.name === 'normalMethod')
      expect(normalFunc?.isOverride).toBe(false)
    })
  })

  describe('Constant Values', () => {
    it('should extract values for top-level constants', () => {
      const strConst = parsedFile.constants.find(c => c.name === 'TOP_LEVEL_STRING')
      expect(strConst?.value).toBe('top-level')
      expect(strConst?.isTopLevel).toBe(true)

      const intConst = parsedFile.constants.find(c => c.name === 'TOP_LEVEL_INT')
      expect(intConst?.value).toBe('42')

      const boolConst = parsedFile.constants.find(c => c.name === 'TOP_LEVEL_BOOL')
      expect(boolConst?.value).toBe('true')
    })

    it('should extract values for companion object constants', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      
      const strConst = cls?.constants.find(c => c.name === 'COMPANION_STRING')
      expect(strConst?.value).toBe('companion')
      expect(strConst?.isCompanion).toBe(true)

      const intConst = cls?.constants.find(c => c.name === 'COMPANION_INT')
      expect(intConst?.value).toBe('100')

      const boolConst = cls?.constants.find(c => c.name === 'COMPANION_BOOL')
      expect(boolConst?.value).toBe('false')
    })
  })
})
