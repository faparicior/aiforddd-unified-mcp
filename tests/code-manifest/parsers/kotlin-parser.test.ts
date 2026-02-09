import { describe, it, expect } from 'vitest'
import { extractClassStructure } from '../../../src/tools/code-manifest/classifier/parsers/index.ts'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

describe('KotlinParser', () => {
  it('should extract a simple Kotlin class', () => {
    const testFile = join('/tmp', 'TestClass.kt')
    const content = `
package com.example

import java.util.Date

class User(
  val id: String,
  val name: String
) {
  fun greet(): String {
    return "Hello, $name"
  }
}
`
    writeFileSync(testFile, content)

    try {
      const result = extractClassStructure(testFile)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.package).toBe('com.example')
        expect(result.imports).toContain('java.util.Date')
        expect(result.classes).toHaveLength(1)
        expect(result.classes[0].name).toBe('User')
        expect(result.classes[0].type).toBe('class')
        expect(result.classes[0].properties).toHaveLength(2)
        expect(result.classes[0].functions).toHaveLength(1)
        expect(result.classes[0].functions[0].name).toBe('greet')
      }
    } finally {
      unlinkSync(testFile)
    }
  })

  it('should extract a data class', () => {
    const testFile = join('/tmp', 'DataClass.kt')
    const content = `
package com.example.data

data class Person(
  val firstName: String,
  val lastName: String,
  val age: Int
)
`
    writeFileSync(testFile, content)

    try {
      const result = extractClassStructure(testFile)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.package).toBe('com.example.data')
        expect(result.classes).toHaveLength(1)
        expect(result.classes[0].name).toBe('Person')
        expect(result.classes[0].type).toBe('data class')
        expect(result.classes[0].properties).toHaveLength(3)
      }
    } finally {
      unlinkSync(testFile)
    }
  })

  it('should extract class with inheritance', () => {
    const testFile = join('/tmp', 'InheritanceClass.kt')
    const content = `
package com.example

class Dog(val name: String) : Animal {
  fun bark() {
    println("Woof!")
  }
}
`
    writeFileSync(testFile, content)

    try {
      const result = extractClassStructure(testFile)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.classes).toHaveLength(1)
        expect(result.classes[0].name).toBe('Dog')
        expect(result.classes[0].superClass).toBe('Animal')
      }
    } finally {
      unlinkSync(testFile)
    }
  })
})
