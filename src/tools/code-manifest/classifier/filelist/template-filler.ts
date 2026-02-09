import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { ClassifiedClassList } from '../types/types.js'
import { trimBasePath } from '../finder/path-utils.js'

/**
 * Writes classified class list rows using a template
 * @param classifiedFiles List of classified files
 * @param template Markdown template string
 * @param basePath Base path to trim from file paths
 * @param alias Alias for the application
 * @returns Formatted markdown rows as string
 */
export function writeClassifiedClassListRows(
  classifiedFiles: ClassifiedClassList,
  template: string,
  basePath: string,
  alias: string
): string {
  const lines = template.split('\n')
  if (lines.length < 3) {
    return ''
  }

  const rows: string[] = []

  for (const item of classifiedFiles) {
    let className = ''
    if (item.classSpecsFound.classes.length > 0) {
      className = item.classSpecsFound.classes[0].name
    }

    const filePath = trimBasePath(item.file.value, basePath)
    const idSource = `${filePath} - ${className}`
    const hash = createHash('sha1').update(idSource).digest('hex')
    const identifier = hash.substring(0, 12)

    // Read file content for content hash
    let contentHashStr = ''
    try {
      const fileContent = readFileSync(item.file.value)
      const contentHash = createHash('sha1').update(fileContent).digest('hex')
      contentHashStr = contentHash
    } catch (err) {
      // Ignore error, leave hash empty
    }

    let row = lines[2]
    row = row.replace(/{{Status}}/g, '') // Status will be determined later
    row = row.replace(/{{Identifier}}/g, identifier)
    row = row.replace(/{{Content}}/g, contentHashStr)
    row = row.replace(/{{Alias}}/g, alias)
    row = row.replace(/{{Catalogued}}/g, '')
    row = row.replace(/{{Processed}}/g, '')
    row = row.replace(/{{Class}}/g, className)
    row = row.replace(/{{File}}/g, filePath)
    // Keep remaining template variables for later processing
    // row = row.replace(/{{Type}}/g, '{{Type}}')
    // row = row.replace(/{{Layer}}/g, '{{Layer}}')
    // row = row.replace(/{{Description}}/g, '{{Description}}')
    // row = row.replace(/{{Category}}/g, '{{Category}}')

    rows.push(row)
  }

  return rows.join('\n') + '\n'
}

