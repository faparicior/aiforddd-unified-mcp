import { describe, it, expect, beforeEach } from 'vitest'
import { KotlinParser } from '../../../src/tools/code-manifest/classifier/parsers/kotlin-parser.ts'
import { join } from 'path'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'

describe('KotlinParser - Annotations', () => {
  let parser: KotlinParser
  const fixturesDir = join(__dirname, '../fixtures')
  const testFile = join(fixturesDir, 'test-annotations.kt')

  beforeEach(() => {
    parser = new KotlinParser()
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true })
    }
  })

  it('should extract class and method annotations', () => {
    const code = `
      package com.example

      @Entity
      @Table(name = "users")
      data class User(
          @Id val id: String
      )

      @RestController
      class UserController {
          
          @GetMapping("/users")
          @PreAuthorize("hasRole('ADMIN')")
          fun getUsers(): List<User> {
              return listOf()
          }
      }
    `
    writeFileSync(testFile, code)

    const result = parser.parse(testFile)
    
    // Class annotations (User)
    const userClass = result.classes.find(c => c.name === 'User')
    expect(userClass).toBeDefined()
    expect(userClass?.annotations).toContain('@Entity')
    expect(userClass?.annotations?.some(a => a.includes('@Table'))).toBe(true)

    // Property annotation (Constructor param)
    const idProp = userClass?.properties.find(p => p.name === 'id')
    expect(idProp).toBeDefined()
    // CodeProperty interface might not have annotations field directly, checked logic stores in metadata
    expect(idProp?.metadata?.annotations).toContain('@Id')

    // Class annotations (UserController)
    const controllerClass = result.classes.find(c => c.name === 'UserController')
    expect(controllerClass).toBeDefined()
    expect(controllerClass?.annotations).toContain('@RestController')

    // Method Annotations
    const func = controllerClass?.functions.find(f => f.name === 'getUsers')
    expect(func).toBeDefined()
    expect(func?.annotations?.some(a => a.includes('@GetMapping'))).toBe(true)
    expect(func?.annotations?.some(a => a.includes('@PreAuthorize'))).toBe(true)

    unlinkSync(testFile)
  })
})
