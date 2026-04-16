#!/usr/bin/env node

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, unlinkSync } from 'fs'
import { filterAndCountRows, getUniqueColumnValues, getMultipleRowsByColumn } from './tools/markdown/utils/parser.js'
import { runClaudeWithStreaming } from './shared/cli/claude-runner.js'
import { PromptManager } from './tools/code-manifest/core.js'
import { readConfig } from './shared/config/config-reader.js'

const VALID_LAYERS = [
    'Domain Layer',
    'Application Layer',
    'Infrastructure Layer',
    'User Interface Layer',
] as const

const VALID_CATEGORIES_BY_LAYER: Record<string, string[]> = {
    'User Interface Layer': ['Controller', 'Event consumer', 'Console command', 'Scheduler', 'Response'],
    'Application Layer':    ['Command', 'Query', 'Use case', 'Event handler', 'Response'],
    'Domain Layer':         ['Domain service', 'Domain event', 'Domain interface', 'Entity', 'Aggregate root', 'Value object', 'Factory', 'Specification', 'Policy', 'Saga', 'Domain exception'],
    'Infrastructure Layer': ['Repository', 'API client', 'Gateway', 'Event producer', 'Integration event', 'Integration service', 'Mapper', 'Adapter', 'Projection', 'Read model', 'Configuration', 'Infrastructure exception'],
}

type ViolatingRow = {
    identifier: string
    class: string
    currentLayer: string
    currentCategory: string
    violation: string
}

/**
 * Returns all rows with invalid Layer or Category values.
 * Rows marked as "Possible outsider" (✓) are intentional architectural outliers — skipped.
 */
function getViolatingRows(manifestPath: string): ViolatingRow[] {
    const violations: ViolatingRow[] = []

    const uniqueLayers = getUniqueColumnValues(manifestPath, 'Layer')
    const invalidLayers = uniqueLayers.filter(v => v !== '' && !VALID_LAYERS.includes(v as any))
    for (const badLayer of invalidLayers) {
        const rows = getMultipleRowsByColumn(manifestPath, 'Layer', badLayer)
        for (const row of rows) {
            if (row['Possible outsider'] === '✓') continue
            if (row['Review layer']) continue
            violations.push({
                identifier: row['Identifier'] ?? '',
                class: row['Class'] ?? '',
                currentLayer: badLayer,
                currentCategory: row['Category'] ?? '',
                violation: `Layer "${badLayer}" is not a valid value`,
            })
        }
    }

    for (const [layer, validCategories] of Object.entries(VALID_CATEGORIES_BY_LAYER)) {
        const rows = getMultipleRowsByColumn(manifestPath, 'Layer', layer)
        for (const row of rows) {
            if (row['Possible outsider'] === '✓') continue
            if (row['Review layer']) continue
            const category = row['Category'] ?? ''
            if (category !== '' && !validCategories.includes(category)) {
                violations.push({
                    identifier: row['Identifier'] ?? '',
                    class: row['Class'] ?? '',
                    currentLayer: layer,
                    currentCategory: category,
                    violation: `Category "${category}" is not valid for layer "${layer}"`,
                })
            }
        }
    }

    return violations
}

/**
 * Builds a targeted prompt asking Claude to fix specific Layer/Category violations.
 * Much more effective than re-running the full catalog prompt when all rows are already catalogued.
 */
function buildFixViolationsPrompt(manifestPath: string, violatingRows: ViolatingRow[]): string {
    const validCategoriesText = Object.entries(VALID_CATEGORIES_BY_LAYER)
        .map(([layer, cats]) => `  - **${layer}**: ${cats.join(', ')}`)
        .join('\n')

    const violationsList = violatingRows
        .map((v, i) =>
            `${i + 1}. Identifier: \`${v.identifier}\` (class: ${v.class})\n   Current Layer: "${v.currentLayer}" | Current Category: "${v.currentCategory}"\n   Problem: ${v.violation}`
        )
        .join('\n')

    return `You must fix Layer and Category violations in the DDD code manifest.

Manifest file: ${manifestPath}

## Valid Layer values (use EXACTLY as written, including " Layer" suffix)
- Domain Layer
- Application Layer
- Infrastructure Layer
- User Interface Layer

## Valid Categories by Layer
${validCategoriesText}

## Violations to fix (${violatingRows.length} total)

${violationsList}

## Instructions

For each violation listed above, mark it for human review by calling \`update_row_by_column\` with:
- filePath: ${manifestPath}
- columnName: "Identifier", value: <the identifier>
- updates: { "Review layer": "✓" }

Do NOT change the Layer or Category values.
Mark ALL ${violatingRows.length} rows. Do not skip any.
`
}

/**
 * Returns the number of invalid Layer/Category violations in the manifest.
 * Rows marked as "Possible outsider" (✓) are intentional architectural outliers — skipped.
 * Used both by --mode validate and the per-batch catalog loop.
 */
function countValidationViolations(manifestPath: string): number {
    return getViolatingRows(manifestPath).length
}

const program = new Command()

program
    .name('ddd-catalog-code-manifest')
    .description('Catalog a DDD code manifest using Claude CLI')
    .version('1.0.0')
    .option('-r, --repository <path>', 'Path to the repository root (defaults to current directory)', '.')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .option('-m, --mode <mode>', 'Execution mode: catalog (default), validate', 'catalog')
    .action(async (options) => {
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

            // ── VALIDATE MODE ────────────────────────────────────────────
            if (options.mode === 'validate') {
                let violations = 0

                // ── Check Layer values ───────────────────────────────────
                const uniqueLayers = getUniqueColumnValues(manifestPath, 'Layer')
                const invalidLayers = uniqueLayers.filter(v => v !== '' && !VALID_LAYERS.includes(v as any))

                if (invalidLayers.length > 0) {
                    console.error(`\nInvalid Layer values found (${invalidLayers.length}):`)
                    for (const badLayer of invalidLayers) {
                        const rows = getMultipleRowsByColumn(manifestPath, 'Layer', badLayer)
                        console.error(`  "${badLayer}" — ${rows.length} row(s):`)
                        for (const row of rows) {
                            console.error(`    - ${row['Identifier'] ?? '(no identifier)'}: ${row['Class'] ?? ''}`)
                        }
                        violations += rows.length
                    }
                } else {
                    console.log('Layer column: OK — all values are valid.')
                }

                // ── Check Category values per Layer ──────────────────────
                let categoryViolations = 0
                for (const [layer, validCategories] of Object.entries(VALID_CATEGORIES_BY_LAYER)) {
                    const rows = getMultipleRowsByColumn(manifestPath, 'Layer', layer)
                    for (const row of rows) {
                        const category = row['Category'] ?? ''
                        if (category !== '' && !validCategories.includes(category)) {
                            if (categoryViolations === 0) {
                                console.error(`\nInvalid Category values found:`)
                            }
                            console.error(`  "${category}" in layer "${layer}" — ${row['Identifier'] ?? '(no identifier)'}: ${row['Class'] ?? ''}`)
                            categoryViolations++
                        }
                    }
                }
                if (categoryViolations === 0) {
                    console.log('Category column: OK — all values are valid.')
                }

                violations += categoryViolations

                if (violations > 0) {
                    console.error(`\nValidation failed: ${violations} violation(s) found.`)
                    process.exit(1)
                }

                console.log('\nManifest validation passed.')
                process.exit(0)
            }

            // ── CATALOG MODE (default) ───────────────────────────────────
            const promptManager = new PromptManager()
            const promptArgs = { manifest_path: destinationFolder }
            const promptContent = promptManager.getPromptContent('catalog-manifest', promptArgs)

            if (options.printOnly) {
                console.log(promptContent)
                process.exit(0)
            }

            const tempPromptFile = resolve(process.cwd(), '.ddd-workflow-prompt-tmp.md')
            writeFileSync(tempPromptFile, promptContent, 'utf-8')

            let isCompleted = false
            let fixAttempts = 0
            const MAX_FIX_ATTEMPTS = 3

            while (!isCompleted) {
                console.log(`Executing Claude workflow for: ${manifestPath}`)

                let exitCode: number
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile)
                } catch (err: any) {
                    console.error('Failed to start claude CLI. Is it installed and in your PATH?')
                    console.error(err)
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                    process.exit(1)
                }

                if (exitCode! !== 0) {
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                    process.exit(exitCode!)
                }

                try {
                    const remaining = filterAndCountRows(manifestPath, 'Catalogued', '')
                    const violatingRows = getViolatingRows(manifestPath)

                    if (remaining === 0 && violatingRows.length === 0) {
                        console.log('\nCataloguing complete! All classes catalogued and validated.')
                        isCompleted = true
                    } else if (remaining === 0 && violatingRows.length > 0) {
                        fixAttempts++
                        if (fixAttempts > MAX_FIX_ATTEMPTS) {
                            console.error(`\n${violatingRows.length} Layer/Category violation(s) remain after ${MAX_FIX_ATTEMPTS} fix attempts. Aborting.`)
                            if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile)
                            process.exit(1)
                        }
                        console.log(`\nAll classes catalogued but ${violatingRows.length} Layer/Category violation(s) found (fix attempt ${fixAttempts}/${MAX_FIX_ATTEMPTS}). Running targeted fix...\n`)
                        // Swap to targeted fix prompt — Claude will only see the violating rows
                        const fixPrompt = buildFixViolationsPrompt(manifestPath, violatingRows)
                        writeFileSync(tempPromptFile, fixPrompt, 'utf-8')
                    } else {
                        // Reset to catalog prompt whenever there are still uncatalogued rows
                        fixAttempts = 0
                        writeFileSync(tempPromptFile, promptContent, 'utf-8')
                        console.log(`\nCataloguing incomplete. ${remaining} classes remaining without a ✓ in the Catalogued column. Re-running...\n`)
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
