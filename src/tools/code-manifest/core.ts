import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractClassStructure } from './classifier/parsers/index.js'
import { readConfig } from '../../shared/config/config-reader.js'
import { ApplicationConfig } from './config/types.js'
import { findFiles } from './classifier/finder/index.js'
import { classifyFilesByClass } from './classifier/filelist/filelist-classifier.js'
import { writeClassifiedClassListRows } from './classifier/filelist/template-filler.js'
import { MarkdownParser, HashComparer } from './classifier/comparison/hash-comparer.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface PromptArgument {
    name: string
    required: boolean
}

export interface ComplementaryPrompt {
    name: string
}

export interface PromptDefinition {
    name: string
    description: string
    arguments: PromptArgument[]
    complementary_prompts?: ComplementaryPrompt[]
    messages: string
}

export class PromptManager {
    private prompts: Map<string, PromptDefinition> = new Map()

    constructor() {
        this.loadPrompts()
    }

    private loadPrompts(): void {
        try {
            const promptFiles = ['catalog-manifest.yml', 'create-use-case-wow.yml', 'create-ui-wow.yml', 'create-value-object-wow.yml']

            for (const promptFile of promptFiles) {
                const promptPath = join(__dirname, '..', '..', 'prompts', promptFile)

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

    public getPromptContent(promptName: string, args: Record<string, any> = {}): string {
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

        // Append complementary prompts if any
        if (promptDef.complementary_prompts) {
            for (const compPrompt of promptDef.complementary_prompts) {
                try {
                    const compPromptPath = join(__dirname, '..', '..', 'prompts', compPrompt.name)
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

        return messages.trim()
    }
}

export function getTemplateHeader(template: string): string {
    const lines = template.split('\n')
    if (lines.length < 2) {
        return ''
    }
    return lines[0] + '\n' + lines[1] + '\n'
}

export function writeMarkdownFile(path: string, header: string, rows: string): void {
    const finalContent = header + rows
    writeFileSync(path, finalContent, 'utf-8')
}

export function writeMarkdownFileWithStatus(path: string, header: string, tempRows: string): void {
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

export async function generateCodeManifest(repositoryPath: string = '.'): Promise<{ generatedFiles: Array<{ type: string, path: string }>, message: string }> {
    const projectRoot = resolve(repositoryPath)
    const absoluteConfigPath = join(projectRoot, '.aiforddd/code_manifest.json')
    const schemaPath = join(__dirname, 'config/config.dddclassifier.json')
    const appConfig = readConfig<ApplicationConfig>(absoluteConfigPath, schemaPath)

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
        } else if (details.language === 'java') {
            suffix = '.java'
        } else if (details.language === 'typescript') {
            suffix = '.ts'
        } else if (details.language === 'php') {
            suffix = '.php'
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

    const destinationFolder = resolve(projectRoot, appConfig.destination_folder)

    // Create destination folder if it doesn't exist
    if (!existsSync(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
    }

    // Write output files with status comparison
    const generatedFiles: Array<{ type: string, path: string }> = []

    if (codeRows.length > 0) {
        const codeManifestPath = join(destinationFolder, 'code-manifest.md')
        writeMarkdownFileWithStatus(codeManifestPath, codeHeader, codeRows)
        generatedFiles.push({ type: 'code_manifest', path: codeManifestPath })
    }
    if (testRows.length > 0) {
        const testManifestPath = join(destinationFolder, 'tests-manifest.md')
        writeMarkdownFileWithStatus(testManifestPath, testHeader, testRows)
        generatedFiles.push({ type: 'tests_manifest', path: testManifestPath })
    }

    return {
        generatedFiles,
        message: generatedFiles.length > 0 ? 'Manifests generated successfully' : 'No manifests generated'
    }
}
