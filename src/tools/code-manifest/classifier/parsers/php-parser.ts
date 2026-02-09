import { readFileSync } from 'fs'
import { Engine } from 'php-parser'
import {
  ParsedFile,
  CodeClass,
  CodeProperty,
  CodeFunction,
  LanguageParser
} from './interfaces.js'

export class PhpParser implements LanguageParser {
  private parser: Engine

  constructor() {
    this.parser = new Engine({
      parser: {
        extractDoc: true,
        php7: true
      },
      ast: {
        withPositions: true
      }
    })
  }

  supports(filePath: string): boolean {
    return filePath.endsWith('.php')
  }

  parse(filePath: string): ParsedFile {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const ast = this.parser.parseCode(content, filePath)

      const parsedFile: ParsedFile = {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'php'
      }

      this.visitNode(ast, parsedFile)

      return parsedFile
    } catch (error) {
      console.error('Error extracting PHP structure:', error)
      return {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'php'
      }
    }
  }

  private visitNode(node: any, parsedFile: ParsedFile) {
    if (!node) return

    if (node.kind === 'program' || node.kind === 'namespace') {
        if (node.kind === 'namespace') {
             parsedFile.package = node.name
        }
        if (node.children) {
            node.children.forEach((child: any) => this.visitNode(child, parsedFile))
        }
    } else if (node.kind === 'usegroup') {
        if (node.items) {
            node.items.forEach((item: any) => {
                 parsedFile.imports.push(item.name)
        })
        }
    } else if (node.kind === 'class' || node.kind === 'interface' || node.kind === 'trait') {
        const classStruc = this.extractClass(node)
        if (classStruc) {
            parsedFile.classes.push(classStruc)
        }
    } else if (node.kind === 'function') {
        const func = this.extractMethod(node)
        if (func) parsedFile.functions.push(func)
    } 
    else if (node.kind === 'constantstatement') {
         if (node.constants) {
             node.constants.forEach((item: any) => {
                 const itemName = typeof item.name === 'object' ? item.name.name : item.name
                 parsedFile.constants.push({
                     name: itemName,
                     value: item.value?.raw || item.value?.value,
                     visibility: 'public',
                     isTopLevel: true,
                     isCompanion: false
                 })
             })
         }
    }
  }

  private extractAttributes(node: any): string[] {
      const annotations: string[] = []
      if (node.attrGroups) {
          node.attrGroups.forEach((group: any) => {
              if (group.attrs) {
                  group.attrs.forEach((attr: any) => {
                      annotations.push('#[' + attr.name + ']')
                  })
              }
          })
      }
      return annotations
  }

  private extractClass(node: any): CodeClass | null {
      const name = typeof node.name === 'object' && node.name.name ? node.name.name : node.name
      if (!name) return null
       
      let type: 'class' | 'interface' | 'enum' = 'class'
      if (node.kind === 'interface') type = 'interface'
      if (node.kind === 'trait') type = 'class' 

      const codeClass: CodeClass = {
          name: name,
          type: type,
          properties: [],
          functions: [],
          constants: [],
          annotations: this.extractAttributes(node),
          metadata: {}
      }

      if (node.extends) {
          codeClass.superClass = node.extends.name
      }
      if (node.implements) {
          codeClass.interfaces = node.implements.map((impl: any) => impl.name)
      }

      const body = node.body || []
      body.forEach((member: any) => {
          if (member.kind === 'method') {
              const func = this.extractMethod(member)
              if (func) codeClass.functions.push(func)
          } else if (member.kind === 'propertystatement') {
              const propGroup = this.extractProperty(member)
              if (propGroup) codeClass.properties.push(...propGroup)
          } else if (member.kind === 'classconstant') {
               if (member.constants) {
                member.constants.forEach((item: any) => {
                    const itemName = typeof item.name === 'object' ? item.name.name : item.name
                    codeClass.constants.push({
                         name: itemName,
                         value: item.value?.value,
                         visibility: member.visibility || 'public',
                         isTopLevel: false,
                         isCompanion: false
                    })
                })
             }
          }
      })

      return codeClass
  }

  private extractMethod(node: any): CodeFunction | null {
      const name = typeof node.name === 'object' && node.name.name ? node.name.name : node.name
      if (!name) return null;

      let visibility = node.visibility || 'public'
      let isStatic = node.isStatic || false

      const parameters = (node.arguments || []).map((arg: any) => {
           let type = 'mixed'
           if (arg.type) {
             type = arg.type.name || arg.type
           }
           const argName = typeof arg.name === 'object' ? arg.name.name : arg.name
           return {
               name: argName,
               type: type
           }
      })

      let returnType = 'void'
      if (node.type) {
         returnType = node.type.name || 'mixed'
      }

      const annotations = this.extractAttributes(node)

      return {
          name,
          visibility,
          isStatic,
          isAsync: false,
          parameters,
          returnType,
          annotations
      }
  }

  private extractProperty(node: any): CodeProperty[] | null {
      const visibility = node.visibility || 'public'
      const isStatic = node.isStatic || false
      
      const properties: CodeProperty[] = []
      
      if (node.properties) {
        node.properties.forEach((item: any) => {
            const itemName = typeof item.name === 'object' ? item.name.name : item.name
            
            let type = 'mixed'
            if (item.type) {
                type = item.type.name
            }

            const isReadonly = item.readonly || false
            const annotations = this.extractAttributes(item)

            properties.push({
                name: itemName,
                type: type,
                visibility: visibility, 
                isStatic: isStatic,
                annotations: annotations,
                metadata: { readonly: isReadonly, mutability: isReadonly ? 'readonly' : 'mutable' }
            })
        })
      }

      return properties
  }
}
