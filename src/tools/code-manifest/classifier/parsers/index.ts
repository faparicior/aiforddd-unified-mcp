import { LanguageParser, ParsedFile } from './interfaces.js'
import { KotlinParser } from './kotlin-parser.js'
import { TypescriptParser } from './typescript-parser.js'
import { PhpParser } from './php-parser.js'
import { JavaParser } from './java-parser.js'

const parsers: LanguageParser[] = [
  new KotlinParser(),
  new TypescriptParser(),
  new PhpParser(),
  new JavaParser()
]

export function getParser(filePath: string): LanguageParser | undefined {
  return parsers.find(parser => parser.supports(filePath))
}

export function extractClassStructure(filePath: string): ParsedFile | null {
  const parser = getParser(filePath)
  if (!parser) {
    return null
  }
  return parser.parse(filePath)
}

export * from './interfaces.js'
export * from './kotlin-parser.js'
export * from './typescript-parser.js'
export * from './java-parser.js'
