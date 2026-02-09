export interface CodeParameter {
  name: string
  type: string
}

export interface CodeConstant {
  name: string
  type?: string
  value?: string
  visibility: string
  annotations?: string[]
  isCompanion?: boolean // Keep for now as metadata, or could be in metadata
  isTopLevel: boolean
  metadata?: Record<string, any>
}

export interface CodeFunction {
  name: string
  visibility: string
  parameters: CodeParameter[]
  returnType?: string
  annotations?: string[]
  isOverride?: boolean
  isAsync?: boolean // Generalized isSuspend
  isStatic?: boolean // Generalized isCompanion
  metadata?: Record<string, any>
}

export interface CodeProperty {
  name: string
  type: string
  visibility: string
  annotations?: string[]
  isStatic?: boolean
  metadata?: Record<string, any> // For mutability (val/var), readonly, etc.
}

export interface CodeClass {
  name: string
  type: string // class, interface, enum, struct
  superClass?: string
  interfaces?: string[]
  properties: CodeProperty[]
  functions: CodeFunction[]
  constants: CodeConstant[]
  annotations?: string[]
  metadata?: Record<string, any>
}

export interface ParsedFile {
  package: string
  imports: string[]
  classes: CodeClass[]
  constants: CodeConstant[]
  functions: CodeFunction[] // Top level functions
  language: string
}

export interface LanguageParser {
  supports(filePath: string): boolean
  parse(filePath: string): ParsedFile
}
