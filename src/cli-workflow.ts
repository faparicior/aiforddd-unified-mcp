#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { runClaudeWithStreaming } from './shared/cli/claude-runner.js';
import { fileURLToPath } from 'url';
import { filterAndCountRows } from './tools/markdown/utils/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PromptArgument {
    name: string;
    required: boolean;
}

interface ComplementaryPrompt {
    name: string;
}

interface PromptDefinition {
    name: string;
    description: string;
    arguments: PromptArgument[];
    complementary_prompts?: ComplementaryPrompt[];
    messages: string;
}

function parseYamlPrompt(content: string): PromptDefinition {
    const lines = content.split('\n');
    let currentSection = '';
    const prompt: Partial<PromptDefinition> = {
        arguments: [],
        complementary_prompts: []
    };

    for (const line of lines) {
        if (line.startsWith('name:')) {
            prompt.name = line.substring(5).trim();
        } else if (line.startsWith('description:')) {
            prompt.description = line.substring(12).trim();
        } else if (line.startsWith('arguments:')) {
            currentSection = 'arguments';
        } else if (line.startsWith('complementary_prompts:')) {
            currentSection = 'complementary_prompts';
        } else if (line.startsWith('messages:')) {
            currentSection = 'messages';
            prompt.messages = '';
        } else if (line.startsWith('  - name:')) {
            if (currentSection === 'arguments') {
                const argName = line.substring(10).trim();
                prompt.arguments!.push({ name: argName, required: false });
            } else if (currentSection === 'complementary_prompts') {
                const promptName = line.substring(10).trim();
                prompt.complementary_prompts!.push({ name: promptName });
            }
        } else if (line.startsWith('    required:')) {
            const lastArg = prompt.arguments![prompt.arguments!.length - 1];
            if (lastArg) {
                lastArg.required = line.substring(14).trim() === 'true';
            }
        } else if (currentSection === 'messages' && line.startsWith('  ')) {
            prompt.messages! += line.substring(2) + '\n';
        } else if (currentSection === 'messages' && !line.startsWith('  ') && line.trim() !== '') {
            // Sometimes messages is mixed without 2 spaces indentation but in a block
            // We assume everything after `messages: |` is part of the message unless it's another root key,
            // but simple YAML parsing is tricky. We'll append if no other section matches.
            prompt.messages! += line + '\n';
        }
    }

    return prompt as PromptDefinition;
}

const program = new Command();
program
    .name('ddd-run')
    .description('Run a programmatic workflow prompt using Claude CLI')
    .version('1.0.0')
    .argument('<workflowFile>', 'Path to the workflow YAML file (e.g., src/prompts/catalog-manifest.yml)')
    .option('-a, --args <json>', 'JSON string containing the workflow arguments')
    .option('-p, --print-only', 'Print the generated prompt without executing Claude')
    .action(async (workflowFile, options) => {
        try {
            let fullPath = resolve(process.cwd(), workflowFile);

            // If it doesn't exist locally, check if it's a bundled prompt in the package
            if (!existsSync(fullPath)) {
                const bundledDistPath = resolve(__dirname, 'prompts', workflowFile);
                const bundledSrcPath = resolve(__dirname, '..', 'src', 'prompts', workflowFile);
                const bundledRootPath = resolve(__dirname, '..', 'prompts', workflowFile);

                if (existsSync(bundledDistPath)) fullPath = bundledDistPath;
                else if (existsSync(bundledSrcPath)) fullPath = bundledSrcPath;
                else if (existsSync(bundledRootPath)) fullPath = bundledRootPath;
            }

            if (!existsSync(fullPath)) {
                console.error(`Workflow file not found locally or within package: ${workflowFile}`);
                process.exit(1);
            }

            const content = readFileSync(fullPath, 'utf-8');
            const promptDef = parseYamlPrompt(content);

            let parsedArgs: Record<string, any> = {};
            if (options.args) {
                try {
                    parsedArgs = JSON.parse(options.args);
                } catch (e) {
                    console.error(`Invalid JSON provided for --args: ${options.args}`);
                    process.exit(1);
                }
            }

            // Check required arguments
            for (const arg of promptDef.arguments) {
                if (arg.required && !(arg.name in parsedArgs)) {
                    console.error(`Missing required argument: ${arg.name}`);
                    console.error(`Provide it via: --args '{"${arg.name}": "value"}'`);
                    process.exit(1);
                }
            }

            // Replace variables in messages
            let promptContent = promptDef.messages;
            for (const [key, value] of Object.entries(parsedArgs)) {
                promptContent = promptContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            }

            // Concatenate complementary prompts
            // Assuming prompts are relative to the workflow file's directory
            const promptDir = dirname(fullPath);
            if (promptDef.complementary_prompts) {
                for (const comp of promptDef.complementary_prompts) {
                    const compPath = join(promptDir, comp.name);
                    if (existsSync(compPath)) {
                        const compContent = readFileSync(compPath, 'utf-8');
                        promptContent += '\n\n' + compContent;
                    } else {
                        console.warn(`Complementary prompt not found: ${compPath}`);
                    }
                }
            }

            if (options.printOnly) {
                console.log(promptContent);
                process.exit(0);
            }

            // Write prompt to a temporary file
            const tempPromptFile = resolve(process.cwd(), '.ddd-workflow-prompt-tmp.md');
            writeFileSync(tempPromptFile, promptContent, 'utf-8');

            let isCompleted = false;

            while (!isCompleted) {
                console.log(`Executing Claude workflow: ${promptDef.name || workflowFile}`);

                let exitCode: number;
                try {
                    exitCode = await runClaudeWithStreaming(tempPromptFile);
                } catch (err: any) {
                    console.error('Failed to start claude CLI. Is it installed and in your PATH?');
                    console.error(err);
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile);
                    process.exit(1);
                }

                if (exitCode! !== 0) {
                    if (existsSync(tempPromptFile)) unlinkSync(tempPromptFile);
                    process.exit(exitCode!);
                }

                if (promptDef.name === 'catalog-manifest') {
                    const manifestPath = parsedArgs['manifest_path'];
                    if (manifestPath && existsSync(manifestPath)) {
                        try {
                            const remaining = filterAndCountRows(manifestPath, 'Catalogued', '');
                            if (remaining === 0) {
                                console.log('\nCataloguing complete! 0 uncatalogued classes remain.');
                                isCompleted = true;
                            } else {
                                console.log(`\nCataloguing incomplete. ${remaining} classes remaining without a ✓ in the Catalogued column. Re-running...\n`);
                                // loop continues
                            }
                        } catch (e: any) {
                            console.error(`\nError checking remaining classes: ${e.message}`);
                            console.error(`Aborting loop.`);
                            isCompleted = true; // Stop loop on error
                        }
                    } else {
                        console.error('\nManifest file not found or not provided in arguments. Cannot check progress.');
                        isCompleted = true;
                    }
                } else {
                    // Standard one-shot execution
                    isCompleted = true;
                }
            }

            // Clean up temporary file
            if (existsSync(tempPromptFile)) {
                unlinkSync(tempPromptFile);
            }

            process.exit(0);

        } catch (e: any) {
            console.error('Error running workflow:', e.message || e);
            process.exit(1);
        }
    });

program.parse(process.argv);
