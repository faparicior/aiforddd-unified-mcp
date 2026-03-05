import { z } from 'zod'
import { CompareCommand } from '../classifier/comparison/index.js'

export const createBackupTool = {
    name: 'create_backup',
    description: 'Create a backup copy of a manifest file in the repository backup directory',
    inputSchema: z.object({
        filePath: z.string().describe('Path to the file to backup'),
    })
}

export async function handleCreateBackup(args: any) {
    const { filePath } = args
    if (!filePath) throw new Error('filePath is required')

    const compareCmd = new CompareCommand()
    compareCmd.createBackup(filePath)

    return {
        content: [{ type: 'text' as const, text: `Backup created for ${filePath}` }]
    }
}
