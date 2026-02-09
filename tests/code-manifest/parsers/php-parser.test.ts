import { describe, it, expect, beforeEach } from 'vitest'
import { PhpParser } from '../../../src/tools/code-manifest/classifier/parsers/php-parser.ts'
import { join } from 'path'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'

describe('PhpParser', () => {
  let parser: PhpParser
  const fixturesDir = join(__dirname, '../fixtures')
  const testFile = join(fixturesDir, 'test-class.php')

  beforeEach(() => {
    parser = new PhpParser()
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true })
    }
  })

  it('should support .php files', () => {
    expect(parser.supports('file.php')).toBe(true)
    expect(parser.supports('file.ts')).toBe(false)
  })

  it('should parse a simple php class', () => {
    // Note: php-parser might require <?php tag
    const code = `<?php
      namespace App\\Domain;
      
      use App\\Utils\\Logger;

      class User {
        private $id;
        public $name;
        
        public function __construct($id, $name) {
          $this->id = $id;
          $this->name = $name;
        }

        public function getName(): string {
          return $this->name;
        }
      }
    `
    writeFileSync(testFile, code)

    const result = parser.parse(testFile)
    
    expect(result.language).toBe('php')
    expect(result.package).toBe('App\\Domain')
    expect(result.imports).toContain('App\\Utils\\Logger')
    
    expect(result.classes).toHaveLength(1)
    const userClass = result.classes[0]
    expect(userClass.name).toBe('User')
    expect(userClass.properties).toHaveLength(2)
    
    const idProp = userClass.properties.find(p => p.name === 'id')
    expect(idProp?.visibility).toBe('private')

    const getNameFunc = userClass.functions.find(f => f.name === 'getName')
    expect(getNameFunc).toBeDefined()
    expect(getNameFunc?.returnType).toBe('string')

    unlinkSync(testFile)
  })

  it('should parse typed properties (PHP 7.4+)', () => {
      const code = `<?php
        class Product {
             public int $price;
             private string $name;
             protected ?string $description;
        }
      `
      writeFileSync(testFile, code)
      const result = parser.parse(testFile)

      const props = result.classes[0].properties
      expect(props).toHaveLength(3)
      
      const price = props.find(p => p.name === 'price')
      expect(price?.type).toBe('int')
      expect(price?.visibility).toBe('public')

      unlinkSync(testFile)
  })

  it('should parse interface', () => {
      const code = `<?php
         interface UserRepository {
             public function findById(int $id): ?User;
         }
      `
      writeFileSync(testFile, code)
      const result = parser.parse(testFile)
      
      expect(result.classes[0].type).toBe('interface')
      expect(result.classes[0].functions).toHaveLength(1)
      expect(result.classes[0].functions[0].parameters[0].name).toBe('id')
      expect(result.classes[0].functions[0].parameters[0].type).toBe('int')

      unlinkSync(testFile)
  })
})
