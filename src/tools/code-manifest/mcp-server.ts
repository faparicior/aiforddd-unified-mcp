#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
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

/**
 * Combined MCP Server for DDD Code Manifest Tools and Prompts
 */
class MCPServer {
  private server: McpServer
  private prompts: Map<string, PromptDefinition> = new Map()

  constructor() {
    this.server = new McpServer(
      {
        name: 'mcp-server',
        version: '1.0.0'
      }
    )

    this.loadPrompts()
    this.setupToolHandlers()
    this.setupErrorHandling()
  }

  private loadPrompts(): void {
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = dirname(__filename)

      // Load multiple prompts
      const promptFiles = ['generate-manifest.yml', 'catalog-manifest.yml']

      for (const promptFile of promptFiles) {
        const promptPath = join(__dirname, '../../prompts', promptFile)

        if (existsSync(promptPath)) {
          const content = readFileSync(promptPath, 'utf-8')
          if (content) {
            const prompt = this.parseYamlPrompt(content)
            this.prompts.set(prompt.name, prompt)
          } else {
            console.error(`Error loading prompt ${promptFile}: content is empty or undefined`)
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

  private setupErrorHandling(): void {
    // Error handling is now automatic in McpServer
    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  private setupToolHandlers(): void {
    // Register all tools
    this.server.registerTool('extract_class_info', {
      description: 'Extract Kotlin class structure from a source file, including package, imports, classes, properties, functions, and constants',
      inputSchema: {
        filePath: z.string().describe('Path to the Kotlin source file to analyze'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleExtractClassInfo(args);
    });

    this.server.registerTool('find_files', {
      description: 'Recursively find all files in a directory that match a specific file extension suffix',
      inputSchema: {
        folder: z.string().describe('Root folder to search'),
        suffix: z.string().describe('File extension to filter (e.g., ".kt", ".java", ".ts")'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleFindFiles(args);
    });

    this.server.registerTool('generate_manifest', {
      description: 'Generate code and test manifests from a configuration file. Creates markdown files with classified file lists and hash-based change tracking',
      inputSchema: {
        repositoryPath: z.string().default('.').describe('Path to the repository root directory'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleGenerateManifest(args);
    });

    this.server.registerTool('compare_manifests', {
      description: 'Compare two markdown manifest files and show differences (NEW, CHANGED, MOVED, RENAMED, DELETED)',
      inputSchema: {
        oldFile: z.string().describe('Path to the old/original manifest file'),
        newFile: z.string().describe('Path to the new/updated manifest file'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleCompareManifests(args);
    });

    this.server.registerTool('compare_with_repository', {
      description: 'Compare a manifest file with its repository backup to track changes',
      inputSchema: {
        manifestPath: z.string().describe('Path to the manifest file to compare'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleCompareWithRepository(args);
    });

    this.server.registerTool('create_backup', {
      description: 'Create a backup copy of a manifest file in the repository backup directory',
      inputSchema: {
        filePath: z.string().describe('Path to the file to backup'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleCreateBackup(args);
    });

    this.server.registerTool('classify_files', {
      description: 'Classify a list of files by their class information and return structured data',
      inputSchema: {
        folder: z.string().describe('Root folder to search for files'),
        suffix: z.string().default('.kt').describe('File extension to filter (e.g., ".kt")'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleClassifyFiles(args);
    });

    this.server.registerTool('get_prompt_content', {
      description: 'Get the content of a prompt template with arguments filled in, ready to be executed',
      inputSchema: {
        promptName: z.string().describe('Name of the prompt to retrieve'),
        arguments: z.record(z.string(), z.any()).optional().describe('Arguments to fill in the prompt template'),
      },
    }, async (args, _extra): Promise<any> => {
      return await this.handleGetPromptContent(args);
    });
  }

  private async handleExtractClassInfo(args: any) {
    const { filePath } = args

    if (!filePath) {
      throw new Error('filePath is required')
    }

    const result = extractClassStructure(filePath)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  }

  private async handleFindFiles(args: any) {
    const { folder, suffix } = args

    if (!folder || !suffix) {
      throw new Error('folder and suffix are required')
    }

    const result = findFiles(folder, suffix)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  }

  private async handleGenerateManifest(args: any) {
    const { repositoryPath = '.' } = args

    // Resolve config path from repository path
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
      if (details.language === 'kotlin') {
        suffix = '.kt'
      }

      // Resolve the path relative to the project root (parent of config directory)
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

    // Resolve destination folder relative to project root
    const destinationFolder = resolve(projectRoot, appConfig.destination_folder)

    // Create destination folder if it doesn't exist
    if (!existsSync(destinationFolder)) {
      mkdirSync(destinationFolder, { recursive: true })
    }

    const generatedFiles: Array<{ type: string, path: string }> = []

    // Write output files with status comparison
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

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  }

  private async handleCompareManifests(args: any) {
    const { oldFile, newFile } = args

    if (!oldFile || !newFile) {
      throw new Error('oldFile and newFile are required')
    }

    const compareCmd = new CompareCommand()

    // Capture console output
    const oldLog = console.log
    let output = ''
    console.log = (...args: any[]) => {
      output += args.join(' ') + '\n'
    }

    try {
      compareCmd.compareFiles(oldFile, newFile)
    } finally {
      console.log = oldLog
    }

    return {
      content: [
        {
          type: 'text',
          text: output || 'Comparison completed'
        }
      ]
    }
  }

  private async handleCompareWithRepository(args: any) {
    const { manifestPath } = args

    if (!manifestPath) {
      throw new Error('manifestPath is required')
    }

    const compareCmd = new CompareCommand()

    // Capture console output
    const oldLog = console.log
    let output = ''
    console.log = (...args: any[]) => {
      output += args.join(' ') + '\n'
    }

    try {
      compareCmd.compareWithRepository(manifestPath)
    } finally {
      console.log = oldLog
    }

    return {
      content: [
        {
          type: 'text',
          text: output || 'Comparison completed'
        }
      ]
    }
  }

  private async handleCreateBackup(args: any) {
    const { filePath } = args

    if (!filePath) {
      throw new Error('filePath is required')
    }

    const compareCmd = new CompareCommand()
    compareCmd.createBackup(filePath)

    return {
      content: [
        {
          type: 'text',
          text: `Backup created for ${filePath}`
        }
      ]
    }
  }

  private async handleClassifyFiles(args: any) {
    const { folder, suffix = '.kt' } = args

    if (!folder) {
      throw new Error('folder is required')
    }

    const files = findFiles(folder, suffix)
    const classifiedFiles = classifyFilesByClass(files)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(classifiedFiles, null, 2)
        }
      ]
    }
  }

  private async handleGetPromptContent(args: any) {
    const { promptName, arguments: promptArgs = {} } = args

    if (!promptName) {
      throw new Error('promptName is required')
    }

    const promptDef = this.prompts.get(promptName)
    if (!promptDef) {
      throw new Error(`Prompt not found: ${promptName}`)
    }

    // Validate required arguments
    for (const arg of promptDef.arguments) {
      if (arg.required && !(arg.name in promptArgs)) {
        throw new Error(`Required argument missing: ${arg.name}`)
      }
    }

    // Fill template
    let messages = promptDef.messages
    for (const [key, value] of Object.entries(promptArgs)) {
      messages = messages.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    // Append complementary prompts content
    if (promptDef.complementary_prompts) {
      for (const compPrompt of promptDef.complementary_prompts) {
        try {
          // Try to find prompts in dist directory first (for built version), then fall back to source
          let compPromptPath = join(__dirname, '..', 'prompts', compPrompt.name)
          if (!existsSync(compPromptPath)) {
            compPromptPath = join(__dirname, '..', '..', 'prompts', compPrompt.name)
          }
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

    return {
      content: [
        {
          type: 'text',
          text: messages.trim()
        }
      ]
    }
  }

  private getTemplateHeader(template: string): string {
    const lines = template.split('\n')
    if (lines.length < 2) {
      return ''
    }
    return lines[0] + '\n' + lines[1] + '\n'
  }

  private writeMarkdownFileWithStatus(path: string, header: string, tempRows: string): void {
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
      this.writeMarkdownFile(path, header, tempRows)
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

  private writeMarkdownFile(path: string, header: string, rows: string): void {
    const finalContent = header + rows
    writeFileSync(path, finalContent, 'utf-8')
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Combined MCP server running on stdio')
  }
}

// Start the server
const server = new MCPServer()
server.run().catch((error) => {
  console.error('Fatal error running server:', error)
  process.exit(1)
})

export { MCPServer }