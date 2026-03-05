import { z } from 'zod'
import { generateCodeManifest } from '../core.js'

export const generateManifestTool = {
    name: 'generate_manifest',
    description: 'Generate code and test manifests from a configuration file. Creates markdown files with classified file lists and hash-based change tracking',
    inputSchema: z.object({
        repositoryPath: z.string().default('.').describe('Path to the repository root directory'),
    })
}

export async function handleGenerateManifest(args: any) {
    const { repositoryPath = '.' } = args
    const result = await generateCodeManifest(repositoryPath)
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
    }
}
