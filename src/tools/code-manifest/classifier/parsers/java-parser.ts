import { readFileSync } from 'fs'
import Parser from 'tree-sitter'
import Java from 'tree-sitter-java'
import {
  ParsedFile,
  CodeClass,
  CodeProperty,
  CodeFunction,
  CodeConstant,
  LanguageParser
} from './interfaces.js'

export class JavaParser implements LanguageParser {
  private parser: Parser

  constructor() {
    this.parser = new Parser()
    this.parser.setLanguage(Java)
  }

  supports(filePath: string): boolean {
    return filePath.endsWith('.java')
  }

  parse(filePath: string): ParsedFile {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const tree = this.parser.parse(content)

      const parsedFile: ParsedFile = {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'java'
      }

      this.visitNode(tree.rootNode, parsedFile, content)

      return parsedFile
    } catch (error) {
      console.error('Error extracting Java structure:', error)
      return {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'java'
      }
    }
  }

  private visitNode(node: Parser.SyntaxNode, parsedFile: ParsedFile, source: string) {
    if (node.type === 'package_declaration') {
      const pkgId = node.descendantsOfType('scoped_identifier')[0] || node.descendantsOfType('identifier')[0]
      if (pkgId) parsedFile.package = pkgId.text
    } else if (node.type === 'import_declaration') {
        const importId = node.descendantsOfType('scoped_identifier')[0] || node.descendantsOfType('identifier')[0]
        if (importId) parsedFile.imports.push(importId.text)
    } else if (node.type === 'class_declaration' || node.type === 'interface_declaration' || node.type === 'enum_declaration' || node.type === 'record_declaration') {
        const classStruc = this.extractClass(node)
        if (classStruc) parsedFile.classes.push(classStruc)
    } else if (node.type === 'field_declaration') {
         // Check for constants at valid scope (though usually inside class, but tree-sitter might visit recursively)
         // We handle fields inside extractClass, but here we might want to catch something if needed?
         // Actually Java doesn't have top level fields.
    }

    if (node.type === 'program') {
        for (let i = 0; i < node.childCount; i++) {
            this.visitNode(node.child(i)!, parsedFile, source)
        }
    }
  }

  private extractAnnotations(node: Parser.SyntaxNode): string[] {
      const annotations: string[] = []
      if (node.children) {
          node.children.forEach(child => {
              if (child.type === 'modifiers') {
                   child.children.forEach(mod => {
                       if (mod.type === 'marker_annotation' || mod.type === 'annotation') {
                           annotations.push(mod.text)
                       }
                   })
              }
          })
      }
      return annotations
  }

  private extractClass(node: Parser.SyntaxNode): CodeClass | null {
    const nameNode = node.children.find(c => c.type === 'identifier')
    if (!nameNode) return null
    
    let type = 'class'
    if (node.type === 'interface_declaration') type = 'interface'
    if (node.type === 'enum_declaration') type = 'enum'
    if (node.type === 'record_declaration') type = 'record'

    const annotations = this.extractAnnotations(node)

    const codeClass: CodeClass = {
        name: nameNode.text,
        type,
        properties: [],
        functions: [],
        constants: [],
        annotations: annotations,
        metadata: {}
    }

    // Inheritance
    const superclass = node.descendantsOfType('superclass')[0]
    if (superclass) {
        codeClass.superClass = superclass.descendantsOfType('type_identifier')[0]?.text
    }
    const interfaces = node.descendantsOfType('super_interfaces')[0]
    if (interfaces) {
        codeClass.interfaces = interfaces.descendantsOfType('type_identifier').map(t => t.text)
    }

    const body = node.descendantsOfType('class_body')[0] || node.descendantsOfType('interface_body')[0] || node.descendantsOfType('enum_body')[0]
    
    if (body) {
        for(let i=0; i<body.childCount; i++) {
            const child = body.child(i)!
            
            if (child.type === 'field_declaration') {
                 this.extractField(child, codeClass)
            } else if (child.type === 'method_declaration') {
                 const func = this.extractMethod(child)
                 if (func) codeClass.functions.push(func)
            } else if (child.type === 'constructor_declaration') {
                 // Constructors - treat as special methods or ignore?
                 // Kotlin parser treated constructor params as properties if val/var.
                 // Java records have components.
            }
        }
    }
    
    // Records components
    if (node.type === 'record_declaration') {
        const header = node.descendantsOfType('record_header')[0]
        if (header) {
             header.descendantsOfType('record_component').forEach(comp => {
                 const name = comp.descendantsOfType('identifier')[0]?.text
                 const type = comp.descendantsOfType('type_identifier')[0]?.text || comp.descendantsOfType('integral_type')[0]?.text || 'Object'
                 if (name) {
                     codeClass.properties.push({
                         name,
                         type,
                         visibility: 'private', // Record fields are private final
                         isStatic: false,
                         metadata: { readonly: true, mutability: 'readonly' }
                     })
                 }
             })
        }
    }

    return codeClass
  }

  private extractField(node: Parser.SyntaxNode, codeClass: CodeClass) {
      const typeNode = node.descendantsOfType('type_identifier')[0] || node.descendantsOfType('integral_type')[0] || node.descendantsOfType('boolean_type')[0]
      const type = typeNode ? typeNode.text : 'Object'
      
      const decls = node.descendantsOfType('variable_declarator')
      
      const modifiers = node.children.find(c => c.type === 'modifiers')
      let visibility = 'package-private'
      let isStatic = false
      let isFinal = false
      
      if (modifiers) {
          if (modifiers.text.includes('public')) visibility = 'public'
          else if (modifiers.text.includes('private')) visibility = 'private'
          else if (modifiers.text.includes('protected')) visibility = 'protected'
          
          if (modifiers.text.includes('static')) isStatic = true
          if (modifiers.text.includes('final')) isFinal = true
      }

      const annotations = this.extractAnnotations(node)

      decls.forEach(decl => {
            const nameNode = decl.descendantsOfType('identifier')[0]
            if(nameNode) {
                // Check if constant (static final)
                if (isStatic && isFinal) {
                    let value = undefined
                    // Try to extract literal value
                    const intLit = decl.descendantsOfType('decimal_integer_literal')[0]
                    if (intLit) value = intLit.text
                    const strLit = decl.descendantsOfType('string_literal')[0]
                    if (strLit) value = strLit.text
                    const boolLit = decl.descendantsOfType('true')[0] || decl.descendantsOfType('false')[0]
                    if (boolLit) value = boolLit.text
                    
                    codeClass.constants.push({
                        name: nameNode.text,
                        value,
                        visibility,
                        isTopLevel: false,
                        isCompanion: false 
                    })
                } else {
                     codeClass.properties.push({
                        name: nameNode.text,
                        type,
                        visibility,
                        isStatic,
                        annotations,
                        metadata: { readonly: isFinal, mutability: isFinal ? 'readonly' : 'mutable' }
                    })
                }
            }
      })
  }

  private extractMethod(node: Parser.SyntaxNode): CodeFunction | null {
      const nameNode = node.children.find(c => c.type === 'identifier')
      if (!nameNode) return null

      const modifiers = node.children.find(c => c.type === 'modifiers')
      let visibility = 'package-private'
      let isStatic = false
      let isAbstract = false
      let isOverride = false

      if (modifiers) {
          if (modifiers.text.includes('public')) visibility = 'public'
          else if (modifiers.text.includes('private')) visibility = 'private'
          else if (modifiers.text.includes('protected')) visibility = 'protected'
          
          if (modifiers.text.includes('static')) isStatic = true
          if (modifiers.text.includes('abstract')) isAbstract = true
          
          // Annotation based override check 
          const annotations = this.extractAnnotations(node)
          if (annotations.some(a => a.includes('Override'))) isOverride = true
      }
      
      const returnTypeNode = node.descendantsOfType('void_type')[0] || node.descendantsOfType('type_identifier')[0] || node.descendantsOfType('integral_type')[0] || node.descendantsOfType('boolean_type')[0]
      const returnType = returnTypeNode ? returnTypeNode.text : 'void'

      const paramsNode = node.descendantsOfType('formal_parameters')[0]
      const parameters: any[] = []
      if (paramsNode) {
          const params = paramsNode.descendantsOfType('formal_parameter')
          params.forEach(p => {
               const pName = p.descendantsOfType('identifier')[0]?.text
               const pType = p.descendantsOfType('type_identifier')[0]?.text || 'Object'
               if (pName) {
                    parameters.push({ name: pName, type: pType })
               }
          })
      }

      const annotations = this.extractAnnotations(node)

      return {
          name: nameNode.text,
          visibility,
          isStatic,
          isAsync: false, // Java async usually via Futures, not keyword
          isOverride,
          parameters,
          returnType,
          annotations
      }
  }
}
