#!/usr/bin/env node

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, unlinkSync } from 'fs'
import { spawnSync } from 'child_process'
import { filterAndCountRows } from './tools/markdown/utils/parser.js'
import { PromptManager } from './tools/code-manifest/core.js'
import { readConfig } from './shared/config/config-reader.js'

const program = new Command()

program
    .name('ddd-catalog-code-manifest')
    .description('Catalog a DDD code manifest using Claude CLI')
    .version('1.0.0')
    .option('-r, --repository <path>', 'Path to the repository root (defaults to current directory)', '.')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .action((options) => {
        try {
            const repositoryPath = resolve(process.cwd(), options.repository)
            const configPath = join(repositoryPath, '.aiforddd/code_manifest.json')

            if (!existsSync(configPath)) {
                console.error(`Config file not found: ${configPath}`)
                process.exit(1)
            }

            // We read the config to understand where the code-manifest.md is located
            // The destination_folder is defined in the config.
            const appConfig = readConfig<any>(configPath, '') // Empty schema path because we don't strictly need validation here, just the 'destination_folder'
            const destinationFolder = resolve(repositoryPath, appConfig.destination_folder || '.aiforddd')
            const manifestPath = join(destinationFolder, 'code-manifest.md')

            if (!existsSync(manifestPath)) {
                console.error(`Manifest file not found: ${manifestPath}`)
                console.error('Please run ddd-create-code-manifest first.')
                process.exit(1)
            }

            const promptManager = new PromptManager()
            const promptName = 'catalog-manifest'
            const promptArgs = { manifest_path: manifestPath }

            // We know catalog-manifest is registered in the PromptManager if it exists
            const promptContent = promptManager.getPromptContent('catalog-manifest', promptArgs)

            if (options.printOnly) {
                console.log(promptContent)
                process.exit(0)
            }

            // Write prompt to a temporary file
            const tempPromptFile = resolve(process.cwd(), '.ddd-workflow-prompt-tmp.md')
            writeFileSync(tempPromptFile, promptContent, 'utf-8')

            let isCompleted = false

            while (!isCompleted) {
                console.log(`Executing Claude workflow for: ${manifestPath}`)

                // Spawn claude CLI using cat <prompt> | claude --dangerously-skip-permissions -p
                const claudeProcess = spawnSync('sh', ['-c', `cat "${tempPromptFile}" | claude --dangerously-skip-permissions -p`], {
                    stdio: 'inherit'
                })

                if (claudeProcess.error) {
                    console.error('Failed to start claude CLI. Is it installed and in your PATH?')
                    console.error(claudeProcess.error)
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                    process.exit(1)
                }

                if (claudeProcess.status !== 0) {
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                    process.exit(claudeProcess.status ?? 1)
                }

                try {
                    const remaining = filterAndCountRows(manifestPath, 'Catalogued', '')
                    if (remaining === 0) {
                        console.log('\nCataloguing complete! 0 uncatalogued classes remain.')
                        isCompleted = true
                    } else {
                        console.log(`\nCataloguing incomplete. ${remaining} classes remaining without a ✓ in the Catalogued column. Re-running...\n`)
                        // loop continues
                    }
                } catch (e: any) {
                    console.error(`\nError checking remaining classes: ${e.message}`)
                    console.error(`Aborting loop.`)
                    isCompleted = true // Stop loop on error
                }
            }

            if (existsSync(tempPromptFile)) {
                unlinkSync(tempPromptFile)
            }

            process.exit(0)

        } catch (e: any) {
            console.error('Error running catalog workflow:', e.message || e)
            process.exit(1)
        }
    })

program.parse(process.argv)
