#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'
import { extractClassStructure } from './classifier/parsers/index.js'
import { CompareCommand } from './classifier/comparison/index.js'
import { readConfig } from '../../shared/config/config-reader.js'
import { ApplicationConfig } from './config/types.js'
import { findFiles } from './classifier/finder/index.js'
import { classifyFilesByClass } from './classifier/filelist/filelist-classifier.js'
import { writeClassifiedClassListRows } from './classifier/filelist/template-filler.js'
import { MarkdownParser, HashComparer } from './classifier/comparison/hash-comparer.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Main entry point for the DDD classifier tool
 */
async function main() {
  const { values } = parseArgs({
    options: {
      config: {
        type: 'string',
        default: 'config/code_manifest.json'
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

    const promptContent = getPromptContent(promptName, promptArgs)
    console.log(promptContent)
    return
  }

  const schemaPath = join(__dirname, 'config/config.dddclassifier.json')
  const appConfig = readConfig<ApplicationConfig>(values.config as string, schemaPath)

  // Determine project root (directory containing config)
  const configDir = dirname(values.config as string)
  const projectRoot = configDir
  const destinationFolder = resolve(projectRoot, appConfig.destination_folder)

  // Create destination folder if it doesn't exist
  if (!existsSync(destinationFolder)) {
    mkdirSync(destinationFolder, { recursive: true })
  }

  const templateCode = readFileSync(join(__dirname, 'config/templates/template-code-filelist.md'), 'utf-8')
  const templateTest = readFileSync(join(__dirname, 'config/templates/template-test-filelist.md'), 'utf-8')

  const codeHeader = getTemplateHeader(templateCode)
  const testHeader = getTemplateHeader(templateTest)

  let codeRows = ''
  let testRows = ''

  for (const details of appConfig.app_details) {
    let suffix = ''
    if (details.language === 'kotlin') {
      suffix = '.kt'
    }

    // Resolve the path relative to the project root
    const resolvedPath = resolve(projectRoot, details.path)
    const files = findFiles(resolvedPath, suffix)

    if (details.mode === 'class') {
      const classifiedFiles = classifyFilesByClass(files)

      if (details.type === 'code') {
        const rows = writeClassifiedClassListRows(classifiedFiles, templateCode, details.path, details.alias)
        codeRows += rows
      } else if (details.type === 'test') {
        const rows = writeClassifiedClassListRows(classifiedFiles, templateTest, details.path, details.alias)
        testRows += rows
      }
    }
  }

  // Write output files with status comparison
  const generatedFiles: Array<{ type: string, path: string }> = []

  if (codeRows.length > 0) {
    const codeManifestPath = join(destinationFolder, 'code_manifest.md')
    writeMarkdownFileWithStatus(codeManifestPath, codeHeader, codeRows)
    generatedFiles.push({ type: 'code_manifest', path: codeManifestPath })
  }
  if (testRows.length > 0) {
    const testManifestPath = join(destinationFolder, 'tests_manifest.md')
    writeMarkdownFileWithStatus(testManifestPath, testHeader, testRows)
    generatedFiles.push({ type: 'tests_manifest', path: testManifestPath })
  }

  // Output results in JSON format
  const result = {
    generatedFiles,
    message: generatedFiles.length > 0 ? 'Manifests generated successfully' : 'No manifests generated'
  }
  console.log(JSON.stringify(result, null, 2))
}

function getTemplateHeader(template: string): string {
  const lines = template.split('\n')
  if (lines.length < 2) {
    return ''
  }
  return lines[0] + '\n' + lines[1] + '\n'
}

function writeMarkdownFile(path: string, header: string, rows: string): void {
  const finalContent = header + rows
  writeFileSync(path, finalContent, 'utf-8')
}

function writeMarkdownFileWithStatus(path: string, header: string, tempRows: string): void {
  const parser = new MarkdownParser()
  const comparer = new HashComparer()

  // Create temporary content without status
  const tempContent = header + tempRows

  // Parse new entries from temporary content
  let newEntries
  try {
    newEntries = parser.parseMarkdownTable(tempContent)
  } catch (err) {
    console.error('Error parsing new entries:', err)
    // Fallback to old method
    writeMarkdownFile(path, header, tempRows)
    return
  }

  // Try to read existing file
  let oldEntries: any[] = []
  if (existsSync(path)) {
    try {
      const existingContent = readFileSync(path, 'utf-8')
      oldEntries = parser.parseMarkdownTable(existingContent)
    } catch (err) {
      // Ignore error, use empty old entries
    }
  }

  // Determine status for entries
  const entriesWithStatus = comparer.determineStatus(oldEntries, newEntries)

  // Format as markdown with status
  const finalContent = comparer.formatAsMarkdown(entriesWithStatus, header)

  // Write final file
  writeFileSync(path, finalContent, 'utf-8')
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

interface PromptArgument {
  name: string
  required: boolean
}

interface PromptDefinition {
  name: string
  description: string
  arguments: PromptArgument[]
  messages: string
}

class PromptManager {
  private prompts: Map<string, PromptDefinition> = new Map()

  constructor() {
    this.loadPrompts()
  }

  private loadPrompts(): void {
    try {
      const promptFiles = ['generate-manifest.yml', 'catalog-manifest.yml']

      for (const promptFile of promptFiles) {
        const promptPath = join(__dirname, '..', 'prompts', promptFile)

        if (existsSync(promptPath)) {
          const content = readFileSync(promptPath, 'utf-8')
          if (content) {
            const prompt = this.parseYamlPrompt(content)
            this.prompts.set(prompt.name, prompt)
          }
        }
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
    }
  }

  private parseYamlPrompt(content: string): PromptDefinition {
    const lines = content.split('\n')
    let currentSection = ''
    const prompt: Partial<PromptDefinition> = {
      arguments: []
    }

    for (const line of lines) {
      if (line.startsWith('name:')) {
        prompt.name = line.substring(5).trim()
      } else if (line.startsWith('description:')) {
        prompt.description = line.substring(12).trim()
      } else if (line.startsWith('arguments:')) {
        currentSection = 'arguments'
      } else if (line.startsWith('messages:')) {
        currentSection = 'messages'
        prompt.messages = ''
      } else if (line.startsWith('  - name:')) {
        const argName = line.substring(10).trim()
        prompt.arguments!.push({ name: argName, required: false })
      } else if (line.startsWith('    required:')) {
        const lastArg = prompt.arguments![prompt.arguments!.length - 1]
        lastArg.required = line.substring(14).trim() === 'true'
      } else if (currentSection === 'messages' && line.startsWith('  ')) {
        prompt.messages! += line.substring(2) + '\n'
      }
    }

    return prompt as PromptDefinition
  }

  getPromptContent(promptName: string, args: Record<string, any> = {}): string {
    const promptDef = this.prompts.get(promptName)
    if (!promptDef) {
      throw new Error(`Prompt not found: ${promptName}`)
    }

    // Validate required arguments
    for (const arg of promptDef.arguments) {
      if (arg.required && !(arg.name in args)) {
        throw new Error(`Required argument missing: ${arg.name}`)
      }
    }

    // Fill template
    let messages = promptDef.messages
    for (const [key, value] of Object.entries(args)) {
      messages = messages.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    return messages.trim()
  }
}

function getPromptContent(promptName: string, args: Record<string, any> = {}): string {
  const promptManager = new PromptManager()
  return promptManager.getPromptContent(promptName, args)
}

// Run main
main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

