import { readFileSync } from 'fs'
import ts from 'typescript'
import {
  ParsedFile,
  CodeClass,
  CodeProperty,
  CodeFunction,
  CodeConstant,
  LanguageParser
} from './interfaces.js'

export class TypescriptParser implements LanguageParser {
  supports(filePath: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx')
  }

  parse(filePath: string): ParsedFile {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      )

      const parsedFile: ParsedFile = {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'typescript'
      }

      this.visitNode(sourceFile, parsedFile)

      return parsedFile
    } catch (error) {
      console.error('Error extracting TypeScript structure:', error)
      return {
        package: '',
        imports: [],
        classes: [],
        constants: [],
        functions: [],
        language: 'typescript'
      }
    }
  }

  private visitNode(node: ts.Node, parsedFile: ParsedFile) {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        parsedFile.imports.push(node.moduleSpecifier.text)
      }
    } else if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const classStruc = this.extractClass(node)
      if (classStruc) {
        parsedFile.classes.push(classStruc)
      }
    } else if (ts.isFunctionDeclaration(node)) {
      const func = this.extractFunction(node)
      if (func) {
        parsedFile.functions.push(func)
      }
    } else if (ts.isVariableStatement(node)) {
      // Top level constants
      if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
         for (const decl of node.declarationList.declarations) {
           if (decl.name && ts.isIdentifier(decl.name)) {
              if (node.declarationList.flags & ts.NodeFlags.Const) {
                const constant: CodeConstant = {
                    name: decl.name.text,
                    visibility: 'public',
                    isTopLevel: true,
                    isCompanion: false,
                    value: decl.initializer?.getText()
                }
                parsedFile.constants.push(constant)
              }
           }
         }
      }
    }

    ts.forEachChild(node, child => this.visitNode(child, parsedFile))
  }

  private extractDecorators(node: ts.Node): string[] {
      const decorators: string[] = []
      if (ts.canHaveDecorators(node)) {
          const decs = ts.getDecorators(node)
          if (decs) {
              decs.forEach(d => {
                  decorators.push(d.getText())
              })
          }
      }
      return decorators
  }

  private extractClass(node: ts.ClassDeclaration | ts.InterfaceDeclaration): CodeClass | null {
    if (!node.name) return null;

    const codeClass: CodeClass = {
      name: node.name.text,
      type: ts.isInterfaceDeclaration(node) ? 'interface' : 'class',
      properties: [],
      functions: [],
      constants: [],
      annotations: this.extractDecorators(node),
      metadata: {}
    }

    // Decorators? VS Code 1.95 uses older TS, decorators are different. 
    // Assuming standard decorators if available (ts.getDecorators in newer TS)
    // or modifiers loops. For simplistic extracting:
    
    // Inheritance
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
            if (clause.types.length > 0) {
               codeClass.superClass = clause.types[0].expression.getText()
            }
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
            codeClass.interfaces = clause.types.map(t => t.expression.getText())
        }
      }
    }

    node.members.forEach(member => {
        if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
            const prop = this.extractProperty(member)
            if (prop) codeClass.properties.push(prop)
        } else if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
            const func = this.extractMethod(member)
            if (func) codeClass.functions.push(func)
        } else if (ts.isConstructorDeclaration(member)) {
            // ctor input params often define props in TS
            member.parameters.forEach(param => {
                if (param.modifiers?.some(m => m.kind === ts.SyntaxKind.PublicKeyword || m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) {
                    // It's a property parameter
                     const prop = this.extractConstructorParamProperty(param)
                     if (prop) codeClass.properties.push(prop)
                }
            })
        }
    })

    return codeClass
  }

  private extractProperty(member: ts.PropertyDeclaration | ts.PropertySignature): CodeProperty | null {
      if (!member.name || !ts.isIdentifier(member.name)) return null

      const name = member.name.text
      const type = member.type ? member.type.getText() : 'any'
      
      let visibility = 'public'
      let isStatic = false
      let isReadonly = false

      if (member.modifiers) {
          member.modifiers.forEach(mod => {
              if (mod.kind === ts.SyntaxKind.PrivateKeyword) visibility = 'private'
              if (mod.kind === ts.SyntaxKind.ProtectedKeyword) visibility = 'protected'
              if (mod.kind === ts.SyntaxKind.StaticKeyword) isStatic = true
              if (mod.kind === ts.SyntaxKind.ReadonlyKeyword) isReadonly = true
          })
      }

      const annotations = this.extractDecorators(member)

      return {
          name,
          type,
          visibility,
          isStatic,
          annotations,
          metadata: { readonly: isReadonly, mutability: isReadonly ? 'readonly' : 'mutable' }
      }
  }

  private extractConstructorParamProperty(param: ts.ParameterDeclaration): CodeProperty | null {
     if (!param.name || !ts.isIdentifier(param.name)) return null

      const name = param.name.text
      const type = param.type ? param.type.getText() : 'any'
      
      let visibility = 'public'
      let isReadonly = false

      if (param.modifiers) {
          param.modifiers.forEach(mod => {
              if (mod.kind === ts.SyntaxKind.PrivateKeyword) visibility = 'private'
              if (mod.kind === ts.SyntaxKind.ProtectedKeyword) visibility = 'protected'
              if (mod.kind === ts.SyntaxKind.ReadonlyKeyword) isReadonly = true
          })
      }

      const annotations = this.extractDecorators(param)

      return {
          name,
          type,
          visibility,
          isStatic: false,
          annotations,
          metadata: { readonly: isReadonly, mutability: isReadonly ? 'readonly' : 'mutable' }
      }
  }

  private extractMethod(member: ts.MethodDeclaration | ts.MethodSignature): CodeFunction | null {
    if (!member.name || !ts.isIdentifier(member.name)) return null

    const name = member.name.text
    let visibility = 'public'
    let isStatic = false
    let isAsync = false
    let isOverride = false

    if (member.modifiers) {
        member.modifiers.forEach(mod => {
            if (mod.kind === ts.SyntaxKind.PrivateKeyword) visibility = 'private'
            if (mod.kind === ts.SyntaxKind.ProtectedKeyword) visibility = 'protected'
            if (mod.kind === ts.SyntaxKind.StaticKeyword) isStatic = true
            if (mod.kind === ts.SyntaxKind.AsyncKeyword) isAsync = true
            if (mod.kind === ts.SyntaxKind.OverrideKeyword) isOverride = true
        })
    }

    const parameters = member.parameters.map(p => {
        return {
            name: p.name.getText(),
            type: p.type ? p.type.getText() : 'any'
        }
    })

    const returnType = member.type ? member.type.getText() : 'void'

    const annotations = this.extractDecorators(member)

    return {
        name,
        visibility,
        isStatic,
        isAsync,
        isOverride,
        parameters,
        returnType,
        annotations
    }
  }

  private extractFunction(node: ts.FunctionDeclaration): CodeFunction | null {
      if (!node.name) return null

      const name = node.name.text
       let visibility = 'public' // Module level funcs default to public-ish (exported)
       let isAsync = false

      if (node.modifiers) {
          node.modifiers.forEach(mod => {
              if (mod.kind === ts.SyntaxKind.AsyncKeyword) isAsync = true
              // In TS module, export keyword means visibility public, otherwise internal/local
              // But for manifest, we can default to public
          })
      }

    const parameters = node.parameters.map(p => {
        return {
            name: p.name.getText(),
            type: p.type ? p.type.getText() : 'any'
        }
    })

    const returnType = node.type ? node.type.getText() : 'void'

    return {
        name,
        visibility,
        isStatic: false, 
        isAsync,
        parameters,
        returnType,
        annotations: []
    }
  }
}
