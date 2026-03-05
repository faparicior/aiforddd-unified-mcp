import { globalToolRegistry } from '../../shared/cli/registry.js';
import { z } from 'zod'
import { extractClassStructure } from './classifier/parsers/index.js'
import { findFiles } from './classifier/finder/index.js'
import { classifyFilesByClass } from './classifier/filelist/filelist-classifier.js'
import { CompareCommand } from './classifier/comparison/index.js'
import { generateCodeManifest, PromptManager } from './core.js'

class CodeManifestTools {
  private promptManager: PromptManager

  constructor() {
    this.promptManager = new PromptManager()
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
    const result = await generateCodeManifest(repositoryPath)
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

    const messages = this.promptManager.getPromptContent(promptName, promptArgs)
    return { content: [{ type: 'text' as const, text: messages }] }
  }


}

export function registerTools() {
  new CodeManifestTools().register()
}
