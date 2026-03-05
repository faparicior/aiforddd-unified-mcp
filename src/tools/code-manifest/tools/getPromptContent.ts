import { z } from 'zod'
import { PromptManager } from '../core.js'

export const getPromptContentTool = {
    name: 'get_prompt_content',
    description: 'Get the content of a prompt template with arguments filled in, ready to be executed',
    inputSchema: z.object({
        promptName: z.string().describe('Name of the prompt to retrieve'),
        arguments: z.record(z.string(), z.any()).optional().describe('Arguments to fill in the prompt template'),
    })
}

export async function handleGetPromptContent(args: any) {
    const { promptName, arguments: promptArgs = {} } = args
    if (!promptName) throw new Error('promptName is required')

    const promptManager = new PromptManager()
    const messages = promptManager.getPromptContent(promptName, promptArgs)

    return {
        content: [{ type: 'text' as const, text: messages }]
    }
}
