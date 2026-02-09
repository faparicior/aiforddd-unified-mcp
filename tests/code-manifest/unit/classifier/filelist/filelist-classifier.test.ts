import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { classifyFilesByClass } from '../../../../../src/tools/code-manifest/classifier/filelist/filelist-classifier.ts'
import { createTempDir, removeTempDir, createKotlinTestFile } from '../../../fixtures/test-helpers.ts'
import { sampleKotlinCode } from '../../../fixtures/mock-data.ts'

describe('filelist-classifier', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempDir('filelist-classifier-')
  })

  afterEach(() => {
    removeTempDir(tempDir)
  })

  describe('classifyFilesByClass', () => {
    it('should classify single file correctly', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        {
          classType: 'data class',
          properties: [
            { name: 'id', type: 'UUID', mutability: 'val' },
            { name: 'name', type: 'String', mutability: 'val' }
          ]
        }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result).toHaveLength(1)
      expect(result[0].file.value).toBe(filePath)
      expect(result[0].classSpecsFound.classes).toHaveLength(1)
      expect(result[0].classSpecsFound.classes[0].name).toBe('User')
    })

    it('should classify multiple files', () => {
      const userFile = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const orderFile = createKotlinTestFile(
        tempDir,
        'Order.kt',
        'com.example.app.domain',
        'Order',
        { classType: 'data class' }
      )

      const filesFound = {
        fileList: [
          { value: userFile },
          { value: orderFile }
        ]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result).toHaveLength(2)
      expect(result[0].classSpecsFound.classes[0].name).toBe('User')
      expect(result[1].classSpecsFound.classes[0].name).toBe('Order')
    })

    it('should handle empty file list', () => {
      const filesFound = {
        fileList: []
      }

      const result = classifyFilesByClass(filesFound)

      expect(result).toHaveLength(0)
    })

    it('should extract package information for each file', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain.model',
        'User',
        { classType: 'data class' }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result[0].classSpecsFound.package).toBe('com.example.app.domain.model')
    })

    it('should extract imports for each file', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        {
          imports: ['java.util.UUID', 'kotlinx.serialization.Serializable'],
          classType: 'data class'
        }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result[0].classSpecsFound.imports).toContain('java.util.UUID')
      expect(result[0].classSpecsFound.imports).toContain('kotlinx.serialization.Serializable')
    })

    it('should extract properties with correct details', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        {
          classType: 'data class',
          properties: [
            { name: 'id', type: 'UUID', mutability: 'val' },
            { name: 'name', type: 'String', mutability: 'val' },
            { name: 'email', type: 'String', mutability: 'val' }
          ]
        }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      const properties = result[0].classSpecsFound.classes[0].properties
      expect(properties).toHaveLength(3)
      expect(properties[0].name).toBe('id')
      expect(properties[0].type).toBe('UUID')
      expect(properties[1].name).toBe('name')
      expect(properties[2].name).toBe('email')
    })

    it('should extract functions from classes', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'UserService.kt',
        'com.example.app.application',
        'UserService',
        {
          classType: 'class',
          functions: [
            { 
              name: 'createUser', 
              returnType: 'User',
              params: [
                { name: 'name', type: 'String' },
                { name: 'email', type: 'String' }
              ]
            },
            { 
              name: 'deleteUser', 
              returnType: 'Unit',
              params: [{ name: 'id', type: 'UUID' }]
            }
          ]
        }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      const functions = result[0].classSpecsFound.classes[0].functions
      expect(functions).toHaveLength(2)
      expect(functions[0].name).toBe('createUser')
      expect(functions[1].name).toBe('deleteUser')
    })

    it('should handle files with no classes', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'Empty.kt',
        'com.example.app',
        '',
        { classType: '' }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result).toHaveLength(1)
      expect(result[0].classSpecsFound.classes).toHaveLength(0)
    })

    it('should classify files with different class types', () => {
      const dataClassFile = createKotlinTestFile(
        tempDir,
        'User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const interfaceFile = createKotlinTestFile(
        tempDir,
        'Repository.kt',
        'com.example.app.domain',
        'Repository',
        { classType: 'interface' }
      )

      const filesFound = {
        fileList: [
          { value: dataClassFile },
          { value: interfaceFile }
        ]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result).toHaveLength(2)
      expect(result[0].classSpecsFound.classes[0].type).toContain('data class')
      expect(result[1].classSpecsFound.classes[0].type).toContain('interface')
    })

    it('should preserve file path in classification result', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'subdir/nested/User.kt',
        'com.example.app.domain',
        'User',
        { classType: 'data class' }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      expect(result[0].file.value).toBe(filePath)
      expect(result[0].file.value).toContain('subdir/nested/User.kt')
    })

    it('should handle classes with annotations', () => {
      const filePath = createKotlinTestFile(
        tempDir,
        'UserService.kt',
        'com.example.app.application',
        'UserService',
        {
          classType: 'class',
          annotations: ['Service', 'Transactional']
        }
      )

      const filesFound = {
        fileList: [{ value: filePath }]
      }

      const result = classifyFilesByClass(filesFound)

      const annotations = result[0].classSpecsFound.classes[0].annotations
      expect(annotations).toContain('@Service')
      expect(annotations).toContain('@Transactional')
    })
  })
})
