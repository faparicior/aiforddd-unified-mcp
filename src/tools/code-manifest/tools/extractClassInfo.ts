import { z } from 'zod'
import { extractClassStructure } from '../classifier/parsers/index.js'

export const extractClassInfoTool = {
    name: 'extract_class_info',
    description: 'Extract Kotlin class structure from a source file, including package, imports, classes, properties, functions, and constants',
    inputSchema: z.object({
        filePath: z.string().describe('Path to the Kotlin source file to analyze'),
    })
}

export async function handleExtractClassInfo(args: any) {
    const { filePath } = args
    if (!filePath) throw new Error('filePath is required')
    const result = extractClassStructure(filePath)
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
    }
}
