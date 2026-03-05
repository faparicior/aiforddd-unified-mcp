import { z } from 'zod'
import { findFiles } from '../classifier/finder/index.js'

export const findFilesTool = {
    name: 'find_files',
    description: 'Recursively find all files in a directory that match a specific file extension suffix',
    inputSchema: z.object({
        folder: z.string().describe('Root folder to search'),
        suffix: z.string().describe('File extension to filter (e.g., ".kt", ".java", ".ts")'),
    })
}

export async function handleFindFiles(args: any) {
    const { folder, suffix } = args
    if (!folder || !suffix) throw new Error('folder and suffix are required')
    const result = findFiles(folder, suffix)
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
    }
}
