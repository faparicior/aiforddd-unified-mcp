import { describe, it, expect, beforeEach } from 'vitest'
import { TypescriptParser } from '../../../src/tools/code-manifest/classifier/parsers/typescript-parser.ts'
import { join } from 'path'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'

describe('TypescriptParser', () => {
  let parser: TypescriptParser
  const fixturesDir = join(__dirname, '../fixtures')
  const testFile = join(fixturesDir, 'test-class.ts')

  beforeEach(() => {
    parser = new TypescriptParser()
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true })
    }
  })

  it('should support .ts and .tsx files', () => {
    expect(parser.supports('file.ts')).toBe(true)
    expect(parser.supports('file.tsx')).toBe(true)
    expect(parser.supports('file.kt')).toBe(false)
  })

  it('should parse a simple class', () => {
    const code = `
      import { Component } from '@angular/core';
      
      export class User {
        private id: number;
        public name: string;
        
        constructor(id: number, name: string) {
          this.id = id;
          this.name = name;
        }

        public getName(): string {
          return this.name;
        }
      }
    `
    writeFileSync(testFile, code)

    const result = parser.parse(testFile)
    
    expect(result.language).toBe('typescript')
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].name).toBe('User')
    expect(result.classes[0].properties).toHaveLength(2)
    expect(result.classes[0].functions).toHaveLength(1)
    
    // Check properties
    const idProp = result.classes[0].properties.find(p => p.name === 'id')
    expect(idProp).toBeDefined()
    expect(idProp?.type).toContain('number')
    expect(idProp?.visibility).toBe('private')

    const nameProp = result.classes[0].properties.find(p => p.name === 'name')
    expect(nameProp).toBeDefined()
    expect(nameProp?.visibility).toBe('public')

    // Check method
    const getNameFunc = result.classes[0].functions.find(f => f.name === 'getName')
    expect(getNameFunc).toBeDefined()
    expect(getNameFunc?.returnType).toContain('string')

    unlinkSync(testFile)
  })

  it('should parse interface', () => {
      const code = `
        export interface UserInterface {
            id: number;
            getName(): string;
        }
      `
      writeFileSync(testFile, code)
      const result = parser.parse(testFile)

      expect(result.classes).toHaveLength(1)
      expect(result.classes[0].name).toBe('UserInterface')
      expect(result.classes[0].type).toBe('interface')
      // Interface properties often don't have visibility modifiers in TS (implied public)
      // The parser defaults to public in absence of modifiers
      expect(result.classes[0].properties).toHaveLength(1)
      expect(result.classes[0].functions).toHaveLength(1)

      unlinkSync(testFile)
  })

  it('should parse constructor properties', () => {
      const code = `
        export class Service {
            constructor(private readonly repo: Repository, public logger: Logger) {}
        }
      `
      writeFileSync(testFile, code)
      const result = parser.parse(testFile)
      
      expect(result.classes[0].properties).toHaveLength(2)
      
      const repo = result.classes[0].properties.find(p => p.name === 'repo')
      expect(repo?.visibility).toBe('private')
      expect(repo?.metadata?.readonly).toBe(true)

      const logger = result.classes[0].properties.find(p => p.name === 'logger')
      expect(logger?.visibility).toBe('public')

      unlinkSync(testFile)
  })
})
