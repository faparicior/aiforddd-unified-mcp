import { readFileSync } from 'fs'
import Parser from 'tree-sitter'
import Kotlin from 'tree-sitter-kotlin'
import {
  ParsedFile,
  CodeClass,
  CodeProperty,
  CodeFunction,
  LanguageParser
} from './interfaces.js'

export class KotlinParser implements LanguageParser {
  private parser: Parser

  constructor() {
    this.parser = new Parser()
    this.parser.setLanguage(Kotlin)
  }

  supports(filePath: string): boolean {
    return filePath.endsWith('.kt')
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
        language: 'kotlin'
      }

      this.visitNode(tree.rootNode, parsedFile, content)

      return parsedFile
    } catch (error) {
      console.error('Error extracting Kotlin structure:', error)
      return {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'kotlin'
      }
    }
  }

  private visitNode(node: Parser.SyntaxNode, parsedFile: ParsedFile, source: string) {
    switch (node.type) {
      case 'package_header':
        const pkgId = node.descendantsOfType('identifier')[0]
        if (pkgId) parsedFile.package = pkgId.text
        break

      case 'import_header':
        const importId = node.descendantsOfType('identifier')[0]
        if (importId) parsedFile.imports.push(importId.text)
        break

      case 'class_declaration':
      case 'object_declaration':
        const classStruc = this.extractClass(node)
        if (classStruc) parsedFile.classes.push(classStruc)
        break
        
      case 'function_declaration':
        // Top level function
        const func = this.extractFunction(node)
        if (func) parsedFile.functions.push(func)
        break

      case 'property_declaration':
         this.extractTopLevelProperty(node, parsedFile)
         break
    }

    if (node.type === 'source_file' || node.type === 'package_header' || node.type === 'import_list') {
        for (let i = 0; i < node.childCount; i++) {
            this.visitNode(node.child(i)!, parsedFile, source)
        }
    }
  }

  private extractAnnotations(node: Parser.SyntaxNode): string[] {
      const annotations: string[] = []
      const modifiers = node.children.find(c => c.type === 'modifiers')
      if (modifiers) {
          modifiers.children.forEach(mod => {
              if (mod.type === 'annotation') {
                  // mod.text includes @, preserve it
                  annotations.push(mod.text)
              }
          })
      }
      return annotations
  }

  private extractClass(node: Parser.SyntaxNode): CodeClass | null {
    let name = ''
    let isInterface = false
    
    if (node.text.startsWith('interface')) {
        isInterface = true
    }
    for(let i=0; i<node.childCount; i++) {
        if (node.child(i)!.type === 'interface') isInterface = true
    }

    const modifiers = node.children.find(c => c.type === 'modifiers')
    let isDataClass = false
    if (modifiers) {
        if (modifiers.text.includes('data')) isDataClass = true
    }

    const typeId = node.children.find(c => c.type === 'type_identifier' || c.type === 'simple_identifier')
    if (typeId) {
        name = typeId.text
    } else {
        return null 
    }

    const annotations = this.extractAnnotations(node)

    const codeClass: CodeClass = {
        name,
        type: isInterface ? 'interface' : (isDataClass ? 'data class' : 'class'),
        properties: [],
        functions: [],
        constants: [],
        annotations: annotations,
        metadata: { isDataClass }
    }

    const delegation = node.descendantsOfType('delegation_specifier')[0]
    if (delegation) {
        const userTypes = delegation.descendantsOfType('user_type')
        if (userTypes.length > 0) {
            userTypes.forEach((t, index) => {
                 if (index === 0) codeClass.superClass = t.text
                 else {
                     codeClass.interfaces = codeClass.interfaces || []
                     codeClass.interfaces.push(t.text)
                 }
            })
        }
    }

    const primaryCtor = node.descendantsOfType('primary_constructor')[0]
    if (primaryCtor) {
        const params = primaryCtor.descendantsOfType('class_parameter')
        params.forEach(param => {
            const isVal = param.text.includes('val ') 
            const isVar = param.text.includes('var ')
            
            if (isVal || isVar) {
                const paramName = param.descendantsOfType('simple_identifier')[0]?.text
                const paramType = param.descendantsOfType('user_type')[0]?.text || 'Any'
                 if (paramName) {
                     const paramAnnotations = this.extractAnnotations(param)

                     codeClass.properties.push({
                         name: paramName,
                         type: paramType,
                         visibility: 'public', 
                         isStatic: false,
                         metadata: { readonly: isVal, mutability: isVal ? 'val' : 'var', annotations: paramAnnotations }
                     })
                 }
            }
        })
    }

    const body = node.descendantsOfType('class_body')[0]
    if (body) {
        for (let i = 0; i < body.childCount; i++) {
            const child = body.child(i)!
            if (child.type === 'property_declaration') {
                const prop = this.extractProperty(child)
                if (prop) codeClass.properties.push(prop)
            } else if (child.type === 'function_declaration') {
                const func = this.extractFunction(child)
                if (func) codeClass.functions.push(func)
            } else if (child.type === 'companion_object') {
                 this.extractCompanion(child, codeClass)
            }
        }
    }

    return codeClass
  }

  private extractProperty(node: Parser.SyntaxNode): CodeProperty | null {
      const decl = node.descendantsOfType('variable_declaration')[0]
      if (!decl) return null
      
      const nameNode = decl.descendantsOfType('simple_identifier')[0]
      if (!nameNode) return null

      const typeNode = decl.descendantsOfType('user_type')[0]
      
      const isVal = node.text.startsWith('val') || node.text.includes('val ')
      
      const modifiers = node.children.find(c => c.type === 'modifiers')
      let visibility = 'public'
      if (modifiers) {
          if (modifiers.text.includes('private')) visibility = 'private'
          if (modifiers.text.includes('protected')) visibility = 'protected'
          if (modifiers.text.includes('internal')) visibility = 'internal'
      }

      const annotations = this.extractAnnotations(node)

      const mutability = isVal ? 'val' : 'var'

      return {
          name: nameNode.text,
          type: typeNode ? typeNode.text : 'inferred',
          visibility,
          isStatic: false,
          metadata: { readonly: isVal, mutability, annotations: annotations }
      }
  }

  private extractTopLevelProperty(node: Parser.SyntaxNode, parsedFile: ParsedFile) {
      const prop = this.extractProperty(node)
      if (prop) {
          const modifiers = node.children.find(c => c.type === 'modifiers')
          if (modifiers && modifiers.text.includes('const')) {
             let value = '...'
             // Try extract value
             // Structure: property_declaration -> ... -> string_literal / integer_literal
             // Usually: property_declaration -> expression (after =) ? Or child is plain node?
             // Debug showed: property_declaration contains '=' then 'string_literal'
             const stringLit = node.descendantsOfType('string_literal')[0]
             if (stringLit) {
                 // Remove quotes
                 const content = stringLit.descendantsOfType('string_content')[0]
                 value = content ? content.text : stringLit.text.replace(/^"|"$/g, '')
             }
             const intLit = node.descendantsOfType('integer_literal')[0]
             if (intLit) value = intLit.text
             
             // Boolean
             const boolLit = node.descendantsOfType('boolean_literal')[0]
             if (boolLit) value = boolLit.text

             parsedFile.constants.push({
                 name: prop.name,
                 value: value, 
                 visibility: prop.visibility,
                 isTopLevel: true,
                 isCompanion: false
             })
          }
      }
  }

  private extractFunction(node: Parser.SyntaxNode): CodeFunction | null {
      const nameNode = node.children.find(c => c.type === 'simple_identifier')
      if (!nameNode) return null

      const paramsNode = node.descendantsOfType('function_value_parameters')[0]
      const parameters: any[] = []
      
      if (paramsNode) {
          const params = paramsNode.descendantsOfType('parameter')
          params.forEach(p => {
              const pName = p.descendantsOfType('simple_identifier')[0]?.text
              const pType = p.descendantsOfType('user_type')[0]?.text || 'Any'
              if (pName) {
                  parameters.push({ name: pName, type: pType })
              }
          })
      }

      let returnType = 'Unit'
      let colonFound = false
      for(let i=0; i<node.childCount; i++) {
          const child = node.child(i)!
          if (child.type === 'function_value_parameters') {
              colonFound = false 
          }
          if (child.type === ':') colonFound = true
          if (colonFound && child.type === 'user_type') {
              returnType = child.text
              break
          }
      }

      const modifiers = node.children.find(c => c.type === 'modifiers')
      let visibility = 'public'
      let isAsync = false
      let isOverride = false
      if (modifiers) {
          if (modifiers.text.includes('private')) visibility = 'private'
          if (modifiers.text.includes('protected')) visibility = 'protected'
          if (modifiers.text.includes('suspend')) isAsync = true
          if (modifiers.text.includes('override')) isOverride = true
      }

      const annotations = this.extractAnnotations(node)

      return {
          name: nameNode.text,
          visibility,
          isStatic: false,
          isAsync,
          isOverride, // Supported in interface
          parameters,
          returnType,
          annotations: annotations
      }
  }

  private extractCompanion(node: Parser.SyntaxNode, codeClass: CodeClass) {
      const body = node.descendantsOfType('class_body')[0]
      if (body) {
          for(let i=0; i<body.childCount; i++) {
              const child = body.child(i)!
              if (child.type === 'property_declaration') {
                  const prop = this.extractProperty(child)
                  const modifiers = child.children.find(c => c.type === 'modifiers')
                  if (prop && modifiers && modifiers.text.includes('const')) {
                      let value = '...'
                      const stringLit = child.descendantsOfType('string_literal')[0]
                      if (stringLit) {
                          const content = stringLit.descendantsOfType('string_content')[0]
                          value = content ? content.text : stringLit.text.replace(/^"|"$/g, '')
                      }
                      const intLit = child.descendantsOfType('integer_literal')[0]
                      if (intLit) value = intLit.text
                      const boolLit = child.descendantsOfType('boolean_literal')[0]
                      if (boolLit) value = boolLit.text

                      codeClass.constants.push({
                          name: prop.name,
                          value: value,
                          visibility: prop.visibility,
                          isTopLevel: false,
                          isCompanion: true
                      })
                  }
              }
          }
      }
  }
}
