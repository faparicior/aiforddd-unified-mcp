import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'
import { extractClassStructure } from './classifier/parsers/index.js'
import { CompareCommand } from './classifier/comparison/index.js'
import { MarkdownParser } from './classifier/comparison/hash-comparer.js'
import { generateCodeManifest, PromptManager } from './core.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Main entry point for the DDD classifier tool
 */
async function main() {
  const { values } = parseArgs({
    options: {
      repository: {
        type: 'string',
        default: '.'
      },
      info: {
        type: 'string'
      },
      'compare-old': {
        type: 'string'
      },
      'compare-new': {
        type: 'string'
      },
      'compare-repo': {
        type: 'string'
      },
      backup: {
        type: 'string'
      },
      'test-dual': {
        type: 'string'
      },
      prompt: {
        type: 'string'
      },
      'prompt-args': {
        type: 'string'
      }
    },
    allowPositionals: true
  })

  // Handle comparison commands
  const compareCmd = new CompareCommand()

  if (values.backup) {
    compareCmd.createBackup(values.backup)
    return
  }

  if (values['test-dual']) {
    testDualComparisonLogic(values['test-dual'])
    return
  }

  if (values['compare-old'] && values['compare-new']) {
    compareCmd.compareFiles(values['compare-old'], values['compare-new'])
    return
  }

  if (values['compare-repo']) {
    compareCmd.compareWithRepository(values['compare-repo'])
    return
  }

  if (values.info) {
    const result = extractClassStructure(values.info)
    console.log('Extracted Kotlin Class Structure:', JSON.stringify(result, null, 2))
    return
  }

  if (values.prompt) {
    const promptName = values.prompt
    const promptArgs = values['prompt-args'] ? JSON.parse(values['prompt-args']) : {}

    const promptManager = new PromptManager()
    const promptContent = promptManager.getPromptContent(promptName, promptArgs)
    console.log(promptContent)
    return
  }

  const repositoryPath = (values.repository as string) || '.'
  const result = await generateCodeManifest(repositoryPath)
  console.log(JSON.stringify(result, null, 2))
}


function testDualComparisonLogic(filePath: string): void {
  const parser = new MarkdownParser()

  // Read the file
  const content = readFileSync(filePath, 'utf-8')

  // Parse entries
  const entries = parser.parseMarkdownTable(content)

  console.log(`=== DUAL COMPARISON TEST FOR ${filePath} ===`)
  console.log(`Total entries: ${entries.length}\n`)

  // Show detailed status breakdown
  const statusCounts = new Map<string, number>()
  for (const entry of entries) {
    const status = entry.status || 'UNCHANGED'
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
  }

  console.log('Status breakdown:')
  for (const [status, count] of statusCounts) {
    console.log(`  ${status}: ${count}`)
  }
}


// Run main
main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

