#!/usr/bin/env node

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { runClaudeWithStreaming } from './shared/cli/claude-runner.js'
import { PromptManager } from './tools/code-manifest/core.js'
import { readConfig } from './shared/config/config-reader.js'

const program = new Command()

program
    .name('ddd-create-ui-wow')
    .description('Analyze UI layer patterns in a code manifest and generate a DDD UI Layer WoW document using Claude CLI')
    .version('1.0.0')
    .option('-r, --repository <path>', 'Path to the repository root (defaults to current directory)', '.')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .action(async (options) => {
        try {
            const repositoryPath = resolve(process.cwd(), options.repository)
            const configPath = join(repositoryPath, '.aiforddd/code_manifest.json')

            if (!existsSync(configPath)) {
                console.error(`Config file not found: ${configPath}`)
                process.exit(1)
            }

            // Read the config to find the destination folder where code-manifest.md is located
            const appConfig = readConfig<any>(configPath, '')
            const destinationFolder = resolve(repositoryPath, appConfig.destination_folder || '.aiforddd')
            const manifestFile = join(destinationFolder, 'code-manifest.md')

            if (!existsSync(manifestFile)) {
                console.error(`Manifest file not found: ${manifestFile}`)
                console.error('Please run ddd-create-code-manifest first.')
                process.exit(1)
            }

            // The prompt uses manifest_path as the folder (not file), since it writes to
            // {{manifest_path}}/wow/ddd-ui-wow.md
            const manifestPath = destinationFolder

            // Ensure output directory exists
            const wowOutputDir = join(manifestPath, 'wow')
            if (!existsSync(wowOutputDir)) {
                mkdirSync(wowOutputDir, { recursive: true })
            }

            const promptManager = new PromptManager()
            const promptArgs = { manifest_path: manifestPath }
            const promptContent = promptManager.getPromptContent('create-ui-wow', promptArgs)

            if (options.printOnly) {
                console.log(promptContent)
                process.exit(0)
            }

            // Write prompt to a temporary file
            const tempPromptFile = resolve(process.cwd(), '.ddd-ui-wow-prompt-tmp.md')
            writeFileSync(tempPromptFile, promptContent, 'utf-8')

            console.log(`Executing Claude workflow to generate UI WoW document for: ${manifestFile}`)

            let exitCode: number;
            try {
                exitCode = await runClaudeWithStreaming(tempPromptFile);
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

            const outputFile = join(wowOutputDir, 'ddd-ui-wow.md')
            if (existsSync(outputFile)) {
                console.log(`\nWoW document generated successfully: ${outputFile}`)
            } else {
                console.warn(`\nWarning: Expected output file not found at: ${outputFile}`)
                console.warn('Claude may not have written the file as expected.')
            }

            process.exit(0)

        } catch (e: any) {
            console.error('Error running create-ui-wow workflow:', e.message || e)
            process.exit(1)
        }
    })

program.parse(process.argv)
