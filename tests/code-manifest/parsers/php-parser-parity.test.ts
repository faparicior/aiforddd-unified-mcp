import { describe, it, expect, beforeEach } from 'vitest'
import { join } from 'path'
import { PhpParser } from '../../../src/tools/code-manifest/classifier/parsers/php-parser.ts'
import { ParsedFile } from '../../../src/tools/code-manifest/classifier/parsers/interfaces.ts'

describe('PhpParser - Parity Features', () => {
  let parser: PhpParser
  let parsedFile: ParsedFile

  beforeEach(() => {
    parser = new PhpParser()
    const filePath = join(process.cwd(), 'tests', 'code-manifest', 'fixtures', 'php-parity.php')
    parsedFile = parser.parse(filePath)
  })

  describe('Attributes (Annotations)', () => {
    it('should extract class attributes', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      expect(cls?.annotations).toContain('#[ClassAttribute]')
    })

    it('should extract property attributes', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const prop = cls?.properties.find(p => p.name === 'readonlyProp')
      expect(prop?.annotations).toContain('#[PropertyAttribute]')
    })

    it('should extract method attributes', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'method')
      expect(func?.annotations).toContain('#[MethodAttribute]')
    })
  })

  describe('Mutability', () => {
    it('should identify readonly properties', () => {
        const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
        const prop = cls?.properties.find(p => p.name === 'readonlyProp')
        expect(prop?.metadata?.readonly).toBe(true)
        expect(prop?.metadata?.mutability).toBe('readonly')
    })

    it('should identify mutable properties', () => {
        const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
        const prop = cls?.properties.find(p => p.name === 'mutableProp')
        expect(prop?.metadata?.readonly).toBe(false)
        expect(prop?.metadata?.mutability).toBe('mutable')
    })
  })

  describe('Constants', () => {
      it('should extract top level constant', () => {
          const c = parsedFile.constants.find(x => x.name === 'TOP_LEVEL_CONST')
          expect(c?.value).toBe('"top-level"')
      })
  })
})
