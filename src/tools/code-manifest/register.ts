
import { globalToolRegistry } from '../../shared/cli/registry.js';
import { z } from 'zod'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { extractClassStructure } from './classifier/parsers/index.js'
import { readConfig } from '../../shared/config/config-reader.js'
import { ApplicationConfig } from './config/types.js'
import { findFiles } from './classifier/finder/index.js'
import { classifyFilesByClass } from './classifier/filelist/filelist-classifier.js'
import { writeClassifiedClassListRows } from './classifier/filelist/template-filler.js'
import { MarkdownParser, HashComparer } from './classifier/comparison/hash-comparer.js'
import { CompareCommand } from './classifier/comparison/index.js'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

interface PromptArgument {
  name: string
  required: boolean
}

interface ComplementaryPrompt {
  name: string
}

interface PromptDefinition {
  name: string
  description: string
  arguments: PromptArgument[]
  complementary_prompts?: ComplementaryPrompt[]
  messages: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))

class CodeManifestTools {
  private prompts: Map<string, PromptDefinition> = new Map()

  constructor() {
    this.loadPrompts()
  }

  public register(): void {
    // Register all tools
    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_extract_class_info',
      description: 'Extract Kotlin class structure from a source file, including package, imports, classes, properties, functions, and constants',
      inputSchema: z.object({
        filePath: z.string().describe('Path to the Kotlin source file to analyze'),
      }),
      handler: async (args) => this.handleExtractClassInfo(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_find_files',
      description: 'Recursively find all files in a directory that match a specific file extension suffix',
      inputSchema: z.object({
        folder: z.string().describe('Root folder to search'),
        suffix: z.string().describe('File extension to filter (e.g., ".kt", ".java", ".ts")'),
      }),
      handler: async (args) => this.handleFindFiles(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_generate_manifest',
      description: 'Generate code and test manifests from a configuration file. Creates markdown files with classified file lists and hash-based change tracking',
      inputSchema: z.object({
        repositoryPath: z.string().default('.').describe('Path to the repository root directory'),
      }),
      handler: async (args) => this.handleGenerateManifest(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_compare_manifests',
      description: 'Compare two markdown manifest files and show differences (NEW, CHANGED, MOVED, RENAMED, DELETED)',
      inputSchema: z.object({
        newFile: z.string().describe('Path to the new/updated manifest file'),
        oldFile: z.string().describe('Path to the old/original manifest file'),
      }),
      handler: async (args) => this.handleCompareManifests(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_compare_with_repository',
      description: 'Compare a manifest file with its repository backup to track changes',
      inputSchema: z.object({
        manifestPath: z.string().describe('Path to the manifest file to compare'),
      }),
      handler: async (args) => this.handleCompareWithRepository(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_create_backup',
      description: 'Create a backup copy of a manifest file in the repository backup directory',
      inputSchema: z.object({
        filePath: z.string().describe('Path to the file to backup'),
      }),
      handler: async (args) => this.handleCreateBackup(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_classify_files',
      description: 'Classify a list of files by their class information and return structured data',
      inputSchema: z.object({
        folder: z.string().describe('Root folder to search for files'),
        suffix: z.string().default('.kt').describe('File extension to filter (e.g., ".kt")'),
      }),
      handler: async (args) => this.handleClassifyFiles(args)
    });

    globalToolRegistry.registerTool({
      name: 'mcp_code_manifest_get_prompt_content',
      description: 'Get the content of a prompt template with arguments filled in, ready to be executed',
      inputSchema: z.object({
        promptName: z.string().describe('Name of the prompt to retrieve'),
        arguments: z.record(z.string(), z.any()).optional().describe('Arguments to fill in the prompt template'),
      }),
      handler: async (args) => this.handleGetPromptContent(args)
    });
  }

  private loadPrompts(): void {
    try {
      // Load multiple prompts
      const promptFiles = ['generate-manifest.yml', 'catalog-manifest.yml']

      for (const promptFile of promptFiles) {
        // Try relative to dist/tools/code-manifest/register.js -> ../../../prompts
        const promptPath = join(__dirname, '..', '..', '..', 'prompts', promptFile)

        if (existsSync(promptPath)) {
          const content = readFileSync(promptPath, 'utf-8')
          if (content) {
            const prompt = this.parseYamlPrompt(content)
            this.prompts.set(prompt.name, prompt)
          } else {
            console.error(`Error loading prompt ${promptFile}: content is empty or undefined`)
          }
        } else {
          console.warn(`Prompt file not found at ${promptPath}`);
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
      } else if (line.startsWith('complementary_prompts:')) {
        currentSection = 'complementary_prompts'
        prompt.complementary_prompts = []
      } else if (line.startsWith('messages:')) {
        currentSection = 'messages'
        prompt.messages = ''
      } else if (line.startsWith('  - name:')) {
        if (currentSection === 'arguments') {
          const argName = line.substring(10).trim()
          prompt.arguments!.push({ name: argName, required: false })
        } else if (currentSection === 'complementary_prompts') {
          const promptName = line.substring(10).trim()
          prompt.complementary_prompts!.push({ name: promptName })
        }
      } else if (line.startsWith('    required:')) {
        const lastArg = prompt.arguments![prompt.arguments!.length - 1]
        lastArg.required = line.substring(14).trim() === 'true'
      } else if (currentSection === 'messages' && line.startsWith('  ')) {
        prompt.messages! += line.substring(2) + '\n'
      }
    }

    return prompt as PromptDefinition
  }

  private async handleExtractClassInfo(args: any) {
    const { filePath } = args
    if (!filePath) throw new Error('filePath is required')
    const result = extractClassStructure(filePath)
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }

  private async handleFindFiles(args: any) {
    const { folder, suffix } = args
    if (!folder || !suffix) throw new Error('folder and suffix are required')
    const result = findFiles(folder, suffix)
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }

  private async handleGenerateManifest(args: any) {
    const { repositoryPath = '.' } = args
    const projectRoot = resolve(repositoryPath)
    const absoluteConfigPath = join(projectRoot, '.aiforddd/code_manifest.json')
    const schemaPath = join(__dirname, 'config/config.dddclassifier.json')
    const appConfig = readConfig<ApplicationConfig>(absoluteConfigPath, schemaPath)

    const templateCode = readFileSync(join(__dirname, 'config/templates/template-code-filelist.md'), 'utf-8')
    const templateTest = readFileSync(join(__dirname, 'config/templates/template-test-filelist.md'), 'utf-8')

    const codeHeader = this.getTemplateHeader(templateCode)
    const testHeader = this.getTemplateHeader(templateTest)

    let codeRows = ''
    let testRows = ''

    for (const details of appConfig.app_details) {
      let suffix = ''
      if (details.language === 'kotlin') suffix = '.kt'

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

    const destinationFolder = resolve(projectRoot, appConfig.destination_folder)
    if (!existsSync(destinationFolder)) mkdirSync(destinationFolder, { recursive: true })

    const generatedFiles: Array<{ type: string, path: string }> = []

    if (codeRows.length > 0) {
      const codeManifestPath = join(destinationFolder, 'code_manifest.md')
      this.writeMarkdownFileWithStatus(codeManifestPath, codeHeader, codeRows)
      generatedFiles.push({ type: 'code_manifest', path: codeManifestPath })
    }
    if (testRows.length > 0) {
      const testManifestPath = join(destinationFolder, 'tests_manifest.md')
      this.writeMarkdownFileWithStatus(testManifestPath, testHeader, testRows)
      generatedFiles.push({ type: 'tests_manifest', path: testManifestPath })
    }

    const result = {
      generatedFiles,
      message: generatedFiles.length > 0 ? 'Manifests generated successfully' : 'No manifests generated'
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }

  private async handleCompareManifests(args: any) {
    const { oldFile, newFile } = args
    if (!oldFile || !newFile) throw new Error('oldFile and newFile are required')
    const compareCmd = new CompareCommand()
    const oldLog = console.log
    let output = ''
    console.log = (...args: any[]) => { output += args.join(' ') + '\n' }
    try { compareCmd.compareFiles(oldFile, newFile) } finally { console.log = oldLog }
    return { content: [{ type: 'text' as const, text: output || 'Comparison completed' }] }
  }

  private async handleCompareWithRepository(args: any) {
    const { manifestPath } = args
    if (!manifestPath) throw new Error('manifestPath is required')
    const compareCmd = new CompareCommand()
    const oldLog = console.log
    let output = ''
    console.log = (...args: any[]) => { output += args.join(' ') + '\n' }
    try { compareCmd.compareWithRepository(manifestPath) } finally { console.log = oldLog }
    return { content: [{ type: 'text' as const, text: output || 'Comparison completed' }] }
  }

  private async handleCreateBackup(args: any) {
    const { filePath } = args
    if (!filePath) throw new Error('filePath is required')
    const compareCmd = new CompareCommand()
    compareCmd.createBackup(filePath)
    return { content: [{ type: 'text' as const, text: `Backup created for ${filePath}` }] }
  }

  private async handleClassifyFiles(args: any) {
    const { folder, suffix = '.kt' } = args
    if (!folder) throw new Error('folder is required')
    const files = findFiles(folder, suffix)
    const classifiedFiles = classifyFilesByClass(files)
    return { content: [{ type: 'text' as const, text: JSON.stringify(classifiedFiles, null, 2) }] }
  }

  private async handleGetPromptContent(args: any) {
    const { promptName, arguments: promptArgs = {} } = args
    if (!promptName) throw new Error('promptName is required')
    const promptDef = this.prompts.get(promptName)
    if (!promptDef) throw new Error(`Prompt not found: ${promptName}`)

    for (const arg of promptDef.arguments) {
      if (arg.required && !(arg.name in promptArgs)) throw new Error(`Required argument missing: ${arg.name}`)
    }

    let messages = promptDef.messages
    for (const [key, value] of Object.entries(promptArgs)) {
      messages = messages.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    if (promptDef.complementary_prompts) {
      for (const compPrompt of promptDef.complementary_prompts) {
        try {
          let compPromptPath = join(__dirname, '..', '..', '..', 'prompts', compPrompt.name)
          if (existsSync(compPromptPath)) {
            const compContent = readFileSync(compPromptPath, 'utf-8')
            messages += '\n\n' + compContent
          } else {
            console.warn(`Complementary prompt file not found: ${compPromptPath}`)
          }
        } catch (error) {
          console.error(`Error reading complementary prompt ${compPrompt.name}:`, error)
        }
      }
    }

    return { content: [{ type: 'text' as const, text: messages.trim() }] }
  }

  private getTemplateHeader(template: string): string {
    const lines = template.split('\n')
    if (lines.length < 2) return ''
    return lines[0] + '\n' + lines[1] + '\n'
  }

  private writeMarkdownFileWithStatus(path: string, header: string, tempRows: string): void {
    const parser = new MarkdownParser()
    const comparer = new HashComparer()
    const tempContent = header + tempRows
    let newEntries
    try { newEntries = parser.parseMarkdownTable(tempContent) } catch (err) {
      console.error('Error parsing new entries:', err)
      this.writeMarkdownFile(path, header, tempRows)
      return
    }

    let oldEntries: any[] = []
    if (existsSync(path)) {
      try {
        const existingContent = readFileSync(path, 'utf-8')
        oldEntries = parser.parseMarkdownTable(existingContent)
      } catch (err) { /* Ignore */ }
    }

    const entriesWithStatus = comparer.determineStatus(oldEntries, newEntries)
    const finalContent = comparer.formatAsMarkdown(entriesWithStatus, header)
    writeFileSync(path, finalContent, 'utf-8')
  }

  private writeMarkdownFile(path: string, header: string, rows: string): void {
    const finalContent = header + rows
    writeFileSync(path, finalContent, 'utf-8')
  }
}

export function registerTools() {
  new CodeManifestTools().register()
}
