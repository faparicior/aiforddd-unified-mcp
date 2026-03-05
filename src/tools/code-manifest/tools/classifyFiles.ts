import { z } from 'zod'
import { findFiles } from '../classifier/finder/index.js'
import { classifyFilesByClass } from '../classifier/filelist/filelist-classifier.js'

export const classifyFilesTool = {
    name: 'classify_files',
    description: 'Classify a list of files by their class information and return structured data',
    inputSchema: z.object({
        folder: z.string().describe('Root folder to search for files'),
        suffix: z.string().default('.kt').describe('File extension to filter (e.g., ".kt")'),
    })
}

export async function handleClassifyFiles(args: any) {
    const { folder, suffix = '.kt' } = args
    if (!folder) throw new Error('folder is required')

    const files = findFiles(folder, suffix)
    const classifiedFiles = classifyFilesByClass(files)

    return {
        content: [{ type: 'text' as const, text: JSON.stringify(classifiedFiles, null, 2) }]
    }
}
