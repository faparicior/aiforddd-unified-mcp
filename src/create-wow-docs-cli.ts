#!/usr/bin/env node

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, unlinkSync, mkdirSync, readdirSync, rmSync } from 'fs'
import { runClaudeWithStreaming } from './shared/cli/claude-runner.js'
import { PromptManager } from './tools/code-manifest/core.js'
import { readConfig } from './shared/config/config-reader.js'
import { getMultipleRowsByMultipleColumns, updateRowByColumn } from './tools/markdown/utils/parser.js'

const isClaudeDebug = process.env['AIFORDDD_CLAUDE_DEBUG'] === '1'

function cleanupTempFile(filePath: string) {
    if (isClaudeDebug) {
        console.error(`[DEBUG] Keeping temp prompt file: ${filePath}`)
        return
    }
    if (existsSync(filePath)) unlinkSync(filePath)
}

function getUnprocessedRows(manifestFile: string, filters: WowTypeFilter[]): Record<string, string>[] {
    const allRows: Record<string, string>[] = []
    for (const filter of filters) {
        try {
            const rows = getMultipleRowsByMultipleColumns(
                manifestFile,
                { 'Layer': filter.layer, 'Category': filter.value },
                undefined,
                0,
                { 'Processed': '✓' },
            )
            allRows.push(...rows)
        } catch {
            // Column or table not found — skip
        }
    }
    return allRows
}

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

export type WowTypeFilter = { column: string; value: string; layer: string }

export const WOW_TYPE_FILTERS: Record<string, WowTypeFilter[]> = {
    'controller':          [{ column: 'Category', value: 'Controller',          layer: 'User Interface Layer' }],
    'event-consumer':      [{ column: 'Category', value: 'Event consumer',      layer: 'User Interface Layer' }],
    'scheduler':           [{ column: 'Category', value: 'Scheduler',           layer: 'User Interface Layer' }],
    'repository':          [{ column: 'Category', value: 'Repository',          layer: 'Infrastructure Layer' }],
    'event-producer':      [{ column: 'Category', value: 'Event producer',      layer: 'Infrastructure Layer' }],
    'api-client':          [
        { column: 'Category', value: 'API client', layer: 'Infrastructure Layer' },
        { column: 'Category', value: 'Gateway',    layer: 'Infrastructure Layer' },
    ],
    'use-case':            [
        { column: 'Category', value: 'Use case', layer: 'Application Layer' },
        { column: 'Category', value: 'Command',  layer: 'Application Layer' },
        { column: 'Category', value: 'Query',     layer: 'Application Layer' },
    ],
    'value-object':        [{ column: 'Category', value: 'Value object',        layer: 'Domain Layer' }],
    'entity':              [{ column: 'Category', value: 'Entity',              layer: 'Domain Layer' }],
    'domain-exception':    [
        { column: 'Category', value: 'Domain exception', layer: 'Domain Layer' },
        { column: 'Category', value: 'Domain exception', layer: 'Application Layer' },
    ],
    'integration-event':   [{ column: 'Category', value: 'Integration event',   layer: 'Infrastructure Layer' }],
    'integration-service': [{ column: 'Category', value: 'Integration service', layer: 'Infrastructure Layer' }],
    'configuration':       [{ column: 'Category', value: 'Configuration',       layer: 'Infrastructure Layer' }],
    'response':            [
        { column: 'Category', value: 'Response', layer: 'User Interface Layer' },
        { column: 'Category', value: 'Response', layer: 'Application Layer' },
    ],
}

const VALID_TYPES = Object.keys(WOW_TYPES).join(', ')
const VALID_MODES = ['full', 'count', 'analyze', 'compose', 'mark-processed', 'generate-initial', 'enrich']

const program = new Command()

program
    .name('ddd-create-wow')
    .description('Generate a DDD Way of Working (WoW) document by analyzing patterns in a code manifest')
    .version('1.0.0')
    .requiredOption('-t, --type <type>', `Type of WoW document to generate. Valid values: ${VALID_TYPES}`)
    .option('-r, --repository <path>', 'Path to the repository root (defaults to current directory)', '.')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .option('-m, --mode <mode>', `Execution mode: ${VALID_MODES.join(', ')}`, 'full')
    .option('--offset <number>', 'For analyze mode: manifest row offset (0-based)', '0')
    .option('--batch-size <number>', 'For analyze mode: number of files to analyze per chunk', '25')
    .option('--chunk-index <number>', 'For analyze mode: chunk number for naming output', '0')
    .option('--analysis-dir <path>', 'For compose mode: directory containing intermediate analysis files')
    .action(async (options) => {
        try {
            const wowConfig = WOW_TYPES[options.type]
            if (!wowConfig) {
                console.error(`Unknown type: "${options.type}"`)
                console.error(`Valid values: ${VALID_TYPES}`)
                process.exit(1)
            }

            if (!VALID_MODES.includes(options.mode)) {
                console.error(`Unknown mode: "${options.mode}"`)
                console.error(`Valid modes: ${VALID_MODES.join(', ')}`)
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

            // ── COUNT MODE ──────────────────────────────────────────────
            if (options.mode === 'count') {
                const filters = WOW_TYPE_FILTERS[options.type]
                if (!filters) {
                    console.error(`No filters defined for type: ${options.type}`)
                    process.exit(1)
                }
                const total = getUnprocessedRows(manifestFile, filters).length
                const outputFilePath = join(wowOutputDir, wowConfig.outputFile)
                const result = JSON.stringify({ count: total, type: options.type, outputExists: existsSync(outputFilePath) })
                process.stdout.write(result)
                process.exit(0)
            }

            // ── MARK-PROCESSED MODE ─────────────────────────────────────
            if (options.mode === 'mark-processed') {
                const filters = WOW_TYPE_FILTERS[options.type]
                if (!filters) {
                    console.error(`No filters defined for type: ${options.type}`)
                    process.exit(1)
                }
                let totalMarked = 0
                for (const filter of filters) {
                    try {
                        const rows = getMultipleRowsByMultipleColumns(manifestFile, {
                            'Layer': filter.layer,
                            'Category': filter.value,
                        })
                        for (const row of rows) {
                            const identifier = row['Identifier']
                            if (identifier) {
                                try {
                                    updateRowByColumn(manifestFile, 'Identifier', identifier, { 'Processed': '✓' })
                                    totalMarked++
                                } catch {
                                    // Skip rows that fail to update
                                }
                            }
                        }
                    } catch {
                        // Skip filters that fail
                    }
                }
                const result = JSON.stringify({ marked: totalMarked, type: options.type })
                process.stdout.write(result)
                process.exit(0)
            }

            // ── ANALYZE MODE ────────────────────────────────────────────
            if (options.mode === 'analyze') {
                const tmpDir = join(wowOutputDir, 'tmp')
                if (!existsSync(tmpDir)) {
                    mkdirSync(tmpDir, { recursive: true })
                }

                // Resolve the exact rows for this chunk in TypeScript — no manifest querying
                // needed inside the prompt. This avoids Claude having to do two-column filtering
                // and works around the lack of offset support in manifest tools.
                // Only include rows that have NOT been marked as processed (Processed ≠ ✓).
                const filters = WOW_TYPE_FILTERS[options.type]
                const allRows = filters ? getUnprocessedRows(manifestFile, filters) : []
                const offset = Number(options.offset)
                const batchSize = Number(options.batchSize)
                const chunkRows = allRows.slice(offset, offset + batchSize)
                const filesJson = JSON.stringify(chunkRows)

                const promptManager = new PromptManager()
                const promptArgs = {
                    manifest_path: manifestPath,
                    wow_type: options.type,
                    chunk_index: options.chunkIndex,
                    output_dir: tmpDir,
                    files_json: filesJson,
                }
                const promptContent = promptManager.getPromptContent('analyze-wow-chunk', promptArgs)

                if (options.printOnly) {
                    console.log(promptContent)
                    process.exit(0)
                }

                const tempPromptFile = resolve(process.cwd(), `.ddd-wow-analyze-${options.type}-chunk-${options.chunkIndex}-prompt-tmp.md`)
                writeFileSync(tempPromptFile, promptContent, 'utf-8')

                console.log(`Analyzing chunk ${options.chunkIndex} (offset=${options.offset}, batchSize=${options.batchSize}) for "${options.type}"`)

                let exitCode: number
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile)
                } catch (err: any) {
                    console.error('Failed to start claude CLI. Is it installed and in your PATH?')
                    cleanupTempFile(tempPromptFile)
                    process.exit(1)
                }

                cleanupTempFile(tempPromptFile)
                if (exitCode! !== 0) process.exit(exitCode!)

                const expectedOutput = join(tmpDir, `analysis-chunk-${options.chunkIndex}.md`)
                if (existsSync(expectedOutput)) {
                    console.log(`\nChunk analysis written: ${expectedOutput}`)
                } else {
                    console.warn(`\nWarning: Expected chunk output not found at: ${expectedOutput}`)
                }
                process.exit(0)
            }

            // ── COMPOSE MODE ────────────────────────────────────────────
            if (options.mode === 'compose') {
                const analysisDir = options.analysisDir || join(wowOutputDir, 'tmp')
                if (!existsSync(analysisDir)) {
                    console.error(`Analysis directory not found: ${analysisDir}`)
                    process.exit(1)
                }

                const analysisFiles = readdirSync(analysisDir)
                    .filter(f => f.startsWith('analysis-chunk-') && f.endsWith('.md'))
                    .sort()
                if (analysisFiles.length === 0) {
                    console.error(`No analysis chunk files found in: ${analysisDir}`)
                    process.exit(1)
                }

                const promptManager = new PromptManager()
                const promptArgs = {
                    manifest_path: manifestPath,
                    wow_type: options.type,
                    analysis_dir: analysisDir,
                    output_file: wowConfig.outputFile,
                    total_chunks: String(analysisFiles.length),
                }
                const promptContent = promptManager.getPromptContent('compose-wow-document', promptArgs)

                if (options.printOnly) {
                    console.log(promptContent)
                    process.exit(0)
                }

                const tempPromptFile = resolve(process.cwd(), `.ddd-wow-compose-${options.type}-prompt-tmp.md`)
                writeFileSync(tempPromptFile, promptContent, 'utf-8')

                console.log(`Composing final "${options.type}" WoW document from ${analysisFiles.length} chunks`)

                let exitCode: number
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile)
                } catch (err: any) {
                    console.error('Failed to start claude CLI. Is it installed and in your PATH?')
                    cleanupTempFile(tempPromptFile)
                    process.exit(1)
                }

                cleanupTempFile(tempPromptFile)
                if (exitCode! !== 0) process.exit(exitCode!)

                const outputFile = join(wowOutputDir, wowConfig.outputFile)
                if (existsSync(outputFile)) {
                    console.log(`\nWoW document generated successfully: ${outputFile}`)
                } else {
                    console.warn(`\nWarning: Expected output file not found at: ${outputFile}`)
                }
                process.exit(0)
            }

            // ── GENERATE-INITIAL MODE ───────────────────────────────────
            if (options.mode === 'generate-initial') {
                const filters = WOW_TYPE_FILTERS[options.type]
                const allRows = filters ? getUnprocessedRows(manifestFile, filters) : []
                const batchSize = Number(options.batchSize)
                const chunkRows = allRows.slice(0, batchSize)
                const totalChunks = Math.ceil(allRows.length / batchSize)

                const promptManager = new PromptManager()
                const promptArgs = {
                    manifest_path: manifestPath,
                    wow_type: options.type,
                    output_file: wowConfig.outputFile,
                    total_files: String(allRows.length),
                    chunk_total: String(totalChunks),
                    files_json: JSON.stringify(chunkRows),
                }
                const promptContent = promptManager.getPromptContent('generate-initial-wow', promptArgs)

                if (options.printOnly) {
                    console.log(promptContent)
                    process.exit(0)
                }

                const tempPromptFile = resolve(process.cwd(), `.ddd-wow-initial-${options.type}-prompt-tmp.md`)
                writeFileSync(tempPromptFile, promptContent, 'utf-8')
                console.log(`Generating initial "${options.type}" WoW document (chunk 1/${totalChunks}, ${chunkRows.length} files)`)

                let exitCode: number
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile)
                } catch (err: any) {
                    console.error('Failed to start claude CLI.')
                    cleanupTempFile(tempPromptFile)
                    process.exit(1)
                }

                cleanupTempFile(tempPromptFile)
                if (exitCode! !== 0) process.exit(exitCode!)

                const outputFile = join(wowOutputDir, wowConfig.outputFile)
                if (existsSync(outputFile)) {
                    console.log(`\nInitial WoW document written: ${outputFile}`)
                } else {
                    console.warn(`\nWarning: Expected output file not found at: ${outputFile}`)
                }
                process.exit(0)
            }

            // ── ENRICH MODE ─────────────────────────────────────────────
            if (options.mode === 'enrich') {
                const filters = WOW_TYPE_FILTERS[options.type]
                const allRows = filters ? getUnprocessedRows(manifestFile, filters) : []
                const offset = Number(options.offset)
                const batchSize = Number(options.batchSize)
                const chunkNumber = Number(options.chunkIndex)
                const totalChunks = Math.ceil(allRows.length / batchSize)
                const chunkRows = allRows.slice(offset, offset + batchSize)

                const promptManager = new PromptManager()
                const promptArgs = {
                    manifest_path: manifestPath,
                    wow_type: options.type,
                    output_file: wowConfig.outputFile,
                    chunk_number: String(chunkNumber),
                    chunk_total: String(totalChunks),
                    files_json: JSON.stringify(chunkRows),
                }
                const promptContent = promptManager.getPromptContent('enrich-wow-document', promptArgs)

                if (options.printOnly) {
                    console.log(promptContent)
                    process.exit(0)
                }

                const tempPromptFile = resolve(process.cwd(), `.ddd-wow-enrich-${options.type}-chunk-${chunkNumber}-prompt-tmp.md`)
                writeFileSync(tempPromptFile, promptContent, 'utf-8')
                console.log(`Enriching "${options.type}" WoW document (chunk ${chunkNumber}/${totalChunks}, ${chunkRows.length} files)`)

                let exitCode: number
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile)
                } catch (err: any) {
                    console.error('Failed to start claude CLI.')
                    cleanupTempFile(tempPromptFile)
                    process.exit(1)
                }

                cleanupTempFile(tempPromptFile)
                if (exitCode! !== 0) process.exit(exitCode!)
                process.exit(0)
            }

            // ── FULL MODE (default — original behavior) ─────────────────
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
                cleanupTempFile(tempPromptFile)
                process.exit(1)
            }

            cleanupTempFile(tempPromptFile)

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
