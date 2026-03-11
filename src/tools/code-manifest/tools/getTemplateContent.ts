import { z } from 'zod'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const getTemplateContentTool = {
    name: 'get_template_content',
    description: 'Get the raw content of a template file by its relative path under src/prompts/templates/',
    inputSchema: z.object({
        templatePath: z.string().describe('Relative path to the template file under src/prompts/templates/ (e.g. "wow/template-ddd-use-case-wow.md")'),
    })
}

export async function handleGetTemplateContent(args: any) {
    const { templatePath } = args
    if (!templatePath) throw new Error('templatePath is required')

    const fullPath = join(__dirname, '..', '..', '..', 'prompts', 'templates', templatePath)

    if (!existsSync(fullPath)) {
        throw new Error(`Template file not found: ${fullPath}`)
    }

    const content = readFileSync(fullPath, 'utf-8')

    return {
        content: [{ type: 'text' as const, text: content }]
    }
}
