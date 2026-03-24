#!/usr/bin/env node

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { runClaudeWithStreaming } from './shared/cli/claude-runner.js'
import { PromptManager } from './tools/code-manifest/core.js'
import { readConfig } from './shared/config/config-reader.js'

export const WOW_TYPES: Record<string, { prompt: string; outputFile: string }> = {
    'controller':          { prompt: 'create-controller-wow',          outputFile: 'ddd-controller-wow.md' },
    'event-consumer':      { prompt: 'create-event-consumer-wow',      outputFile: 'ddd-event-consumer-wow.md' },
    'scheduler':           { prompt: 'create-scheduler-wow',           outputFile: 'ddd-scheduler-wow.md' },
    'repository':          { prompt: 'create-repository-wow',          outputFile: 'ddd-repository-wow.md' },
    'event-producer':      { prompt: 'create-event-producer-wow',      outputFile: 'ddd-event-producer-wow.md' },
    'api-client':          { prompt: 'create-api-client-wow',          outputFile: 'ddd-api-client-wow.md' },
    'use-case':            { prompt: 'create-use-case-wow',            outputFile: 'ddd-use-case-wow.md' },
    'value-object':        { prompt: 'create-value-object-wow',        outputFile: 'ddd-value-object-wow.md' },
    'entity':              { prompt: 'create-entity-wow',              outputFile: 'ddd-entity-wow.md' },
    'domain-exception':    { prompt: 'create-domain-exception-wow',    outputFile: 'ddd-domain-exception-wow.md' },
    'integration-event':   { prompt: 'create-integration-event-wow',   outputFile: 'ddd-integration-event-wow.md' },
    'integration-service': { prompt: 'create-integration-service-wow', outputFile: 'ddd-integration-service-wow.md' },
    'configuration':       { prompt: 'create-configuration-wow',       outputFile: 'ddd-configuration-wow.md' },
    'response':            { prompt: 'create-response-wow',            outputFile: 'ddd-response-wow.md' },
}

const VALID_TYPES = Object.keys(WOW_TYPES).join(', ')

const program = new Command()

program
    .name('ddd-create-wow')
    .description('Generate a DDD Way of Working (WoW) document by analyzing patterns in a code manifest')
    .version('1.0.0')
    .requiredOption('-t, --type <type>', `Type of WoW document to generate. Valid values: ${VALID_TYPES}`)
    .option('-r, --repository <path>', 'Path to the repository root (defaults to current directory)', '.')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .action(async (options) => {
        try {
            const wowConfig = WOW_TYPES[options.type]
            if (!wowConfig) {
                console.error(`Unknown type: "${options.type}"`)
                console.error(`Valid values: ${VALID_TYPES}`)
                process.exit(1)
            }

            const repositoryPath = resolve(process.cwd(), options.repository)
            const configPath = join(repositoryPath, '.aiforddd/code_manifest.json')

            if (!existsSync(configPath)) {
                console.error(`Config file not found: ${configPath}`)
                process.exit(1)
            }

            const appConfig = readConfig<any>(configPath, '')
            const destinationFolder = resolve(repositoryPath, appConfig.destination_folder || '.aiforddd')
            const manifestFile = join(destinationFolder, 'code-manifest.md')

            if (!existsSync(manifestFile)) {
                console.error(`Manifest file not found: ${manifestFile}`)
                console.error('Please run ddd-create-code-manifest first.')
                process.exit(1)
            }

            const manifestPath = destinationFolder

            const wowOutputDir = join(manifestPath, 'wow')
            if (!existsSync(wowOutputDir)) {
                mkdirSync(wowOutputDir, { recursive: true })
            }

            const promptManager = new PromptManager()
            const promptArgs = { manifest_path: manifestPath }
            const promptContent = promptManager.getPromptContent(wowConfig.prompt, promptArgs)

            if (options.printOnly) {
                console.log(promptContent)
                process.exit(0)
            }

            const tempPromptFile = resolve(process.cwd(), `.ddd-wow-${options.type}-prompt-tmp.md`)
            writeFileSync(tempPromptFile, promptContent, 'utf-8')

            console.log(`Generating "${options.type}" WoW document for: ${manifestFile}`)

            let exitCode: number
            try {
                exitCode = await runClaudeWithStreaming(tempPromptFile)
            } catch (err: any) {
                console.error('Failed to start claude CLI. Is it installed and in your PATH?')
                console.error(err)
                if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                process.exit(1)
            }

            if (existsSync(tempPromptFile)) {
                unlinkSync(tempPromptFile)
            }

            if (exitCode! !== 0) {
                process.exit(exitCode!)
            }

            const outputFile = join(wowOutputDir, wowConfig.outputFile)
            if (existsSync(outputFile)) {
                console.log(`\nWoW document generated successfully: ${outputFile}`)
            } else {
                console.warn(`\nWarning: Expected output file not found at: ${outputFile}`)
                console.warn('Claude may not have written the file as expected.')
            }

            process.exit(0)

        } catch (e: any) {
            console.error('Error running create-wow workflow:', e.message || e)
            process.exit(1)
        }
    })

program.parse(process.argv)
