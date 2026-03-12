import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

/**
 * Creates a temporary directory for testing
 */
export function createTempDir(prefix: string = 'test-'): string {
  const tempPath = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}`)
  mkdirSync(tempPath, { recursive: true })
  return tempPath
}

/**
 * Removes a directory recursively
 */
export function removeTempDir(dirPath: string): void {
  try {
    rmSync(dirPath, { recursive: true, force: true })
  } catch (err) {
    console.error(`Failed to remove temp dir: ${dirPath}`, err)
  }
}

/**
 * Creates a file with content in the specified directory
 */
export function createTestFile(dirPath: string, filename: string, content: string): string {
  const filePath = join(dirPath, filename)
  const fileDir = join(dirPath, ...filename.split('/').slice(0, -1))
  
  // Ensure the base directory exists
  mkdirSync(dirPath, { recursive: true })
  
  if (fileDir !== dirPath) {
    mkdirSync(fileDir, { recursive: true })
  }
  
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * Creates a Kotlin file structure for testing
 */
export function createKotlinTestFile(
  dirPath: string,
  filename: string,
  packageName: string,
  className: string,
  options: {
    imports?: string[]
    classType?: string
    properties?: Array<{ name: string; type: string; mutability: 'val' | 'var' }>
    functions?: Array<{ name: string; returnType?: string; params?: Array<{ name: string; type: string }> }>
    annotations?: string[]
  } = {}
): string {
  const {
    imports = [],
    classType = 'class',
    properties = [],
    functions = [],
    annotations = []
  } = options

  let content = `package ${packageName}\n\n`

  if (imports.length > 0) {
    content += imports.map(imp => `import ${imp}`).join('\n') + '\n\n'
  }

  if (annotations.length > 0) {
    content += annotations.map(ann => `@${ann}`).join('\n') + '\n'
  }

  content += `${classType} ${className} {\n`

  for (const prop of properties) {
    content += `    ${prop.mutability} ${prop.name}: ${prop.type}\n`
  }

  if (properties.length > 0 && functions.length > 0) {
    content += '\n'
  }

  for (const func of functions) {
    const params = func.params?.map(p => `${p.name}: ${p.type}`).join(', ') || ''
    const returnType = func.returnType ? `: ${func.returnType}` : ''
    content += `    fun ${func.name}(${params})${returnType} {\n`
    content += `        // Implementation\n`
    content += `    }\n\n`
  }

  content += '}\n'

  return createTestFile(dirPath, filename, content)
}

/**
 * Creates a Kotlin file with multiple classes for testing
 */
export function createMultiClassKotlinTestFile(
  dirPath: string,
  filename: string,
  packageName: string,
  classNames: string[]
): string {
  let content = `package ${packageName}\n\n`
  for (const name of classNames) {
    content += `data class ${name}(val id: String)\n\n`
  }
  return createTestFile(dirPath, filename, content)
}

/**
 * Creates a markdown table for testing
 */
export function createTestMarkdownTable(entries: Array<{
  status?: string
  identifier: string
  contentHash: string
  alias: string
  catalogued?: string
  processed?: string
  class: string
  file: string
  type?: string
  layer?: string
  description?: string
}>): string {
  let content = '| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |\n'
  content += '|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|\n'

  for (const entry of entries) {
    const row = [
      entry.status || '',
      entry.identifier,
      entry.contentHash,
      entry.alias,
      entry.catalogued || '',
      entry.processed || '',
      entry.class,
      entry.file,
      entry.type || '{{Type}}',
      entry.layer || '{{Layer}}',
      entry.description || '{{Description}}'
    ]
    content += '| ' + row.join(' | ') + ' |\n'
  }

  return content
}

/**
 * Creates a test configuration JSON
 */
export function createTestConfig(appDetails: Array<{
  path: string
  language: string
  mode: string
  alias: string
  type: string
}>, destinationFolder: string = './output'): string {
  return JSON.stringify({
    version: '1.0.0',
    app_details: appDetails,
    destination_folder: destinationFolder
  }, null, 2)
}
