import { describe, it, expect, beforeEach } from 'vitest'
import { join } from 'path'
import { TypescriptParser } from '../../../src/tools/code-manifest/classifier/parsers/typescript-parser.ts'
import { ParsedFile } from '../../../src/tools/code-manifest/classifier/parsers/interfaces.ts'

describe('TypescriptParser - Parity Features', () => {
  let parser: TypescriptParser
  let parsedFile: ParsedFile

  beforeEach(() => {
    parser = new TypescriptParser()
    const filePath = join(process.cwd(), 'tests', 'code-manifest', 'fixtures', 'typescript-parity.ts')
    parsedFile = parser.parse(filePath)
  })

  describe('Annotations (Decorators)', () => {
    it('should extract class decorators', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      expect(cls?.annotations).toContain('@ClassDecorator')
    })

    it('should extract property decorators', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const prop = cls?.properties.find(p => p.name === 'readonlyProp')
      expect(prop?.annotations).toContain('@PropertyDecorator')
    })

    it('should extract method decorators', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'method')
      expect(func?.annotations).toContain('@MethodDecorator')
    })
    
     it('should extract constructor param decorators', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const prop = cls?.properties.find(p => p.name === 'ctorReadonly')
      expect(prop?.annotations).toContain('@ParamDecorator')
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

     it('should identify readonly constructor param properties', () => {
        const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
        const prop = cls?.properties.find(p => p.name === 'ctorReadonly')
        expect(prop?.metadata?.readonly).toBe(true)
    })
  })

  describe('Overrides', () => {
    it('should identify override methods', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'method')
      expect(func?.isOverride).toBe(true)
    })

    it('should identify non-override methods', () => {
      const cls = parsedFile.classes.find(c => c.name === 'ParityClass')
      const func = cls?.functions.find(f => f.name === 'normalMethod')
      expect(func?.isOverride).toBe(false)
    })
  })

  describe('Constants', () => {
      it('should extract top level constant', () => {
          const c = parsedFile.constants.find(x => x.name === 'TOP_LEVEL_CONST')
          expect(c?.value).toContain('"top-level"')
      })
  })
})
