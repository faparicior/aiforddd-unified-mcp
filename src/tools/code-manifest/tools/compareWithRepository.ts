import { z } from 'zod'
import { CompareCommand } from '../classifier/comparison/index.js'

export const compareWithRepositoryTool = {
    name: 'compare_with_repository',
    description: 'Compare a manifest file with its repository backup to track changes',
    inputSchema: z.object({
        manifestPath: z.string().describe('Path to the manifest file to compare'),
    })
}

export async function handleCompareWithRepository(args: any) {
    const { manifestPath } = args
    if (!manifestPath) throw new Error('manifestPath is required')

    const compareCmd = new CompareCommand()
    const oldLog = console.log
    let output = ''
    console.log = (...logArgs: any[]) => {
        output += logArgs.join(' ') + '\n'
    }

    try {
        compareCmd.compareWithRepository(manifestPath)
    } finally {
        console.log = oldLog
    }

    return {
        content: [{ type: 'text' as const, text: output || 'Comparison completed' }]
    }
}
