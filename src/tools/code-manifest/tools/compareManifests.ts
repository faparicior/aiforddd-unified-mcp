import { z } from 'zod'
import { CompareCommand } from '../classifier/comparison/index.js'

export const compareManifestsTool = {
    name: 'compare_manifests',
    description: 'Compare two markdown manifest files and show differences (NEW, CHANGED, MOVED, RENAMED, DELETED)',
    inputSchema: z.object({
        oldFile: z.string().describe('Path to the old/original manifest file'),
        newFile: z.string().describe('Path to the new/updated manifest file'),
    })
}

export async function handleCompareManifests(args: any) {
    const { oldFile, newFile } = args
    if (!oldFile || !newFile) throw new Error('oldFile and newFile are required')

    const compareCmd = new CompareCommand()
    const oldLog = console.log
    let output = ''
    console.log = (...logArgs: any[]) => {
        output += logArgs.join(' ') + '\n'
    }

    try {
        compareCmd.compareFiles(oldFile, newFile)
    } finally {
        console.log = oldLog
    }

    return {
        content: [{ type: 'text' as const, text: output || 'Comparison completed' }]
    }
}
