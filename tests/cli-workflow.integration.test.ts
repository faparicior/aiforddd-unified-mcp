import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, rmdirSync, chmodSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('cli-workflow (ddd-run) Integration', () => {
    const testDir = join(__dirname, '.tmp-cli-workflow');
    const fakeClaudePath = join(testDir, 'claude');
    const manifestPath = join(testDir, 'manifest.md');

    beforeAll(() => {
        if (!existsSync(testDir)) {
            mkdirSync(testDir, { recursive: true });
        }

        // Create a fake claude command that reads stdin and simulates work
        // Outputs stream-json format so runClaudeWithStreaming can forward the text
        const fakeClaudeScript = `#!/usr/bin/env node
import fs from 'fs';
const manifestFile = '${manifestPath}';

if (fs.existsSync(manifestFile)) {
    let content = fs.readFileSync(manifestFile, 'utf8');
    const lines = content.split('\\n');
    let updated = false;

    for (let i = 0; i < lines.length; i++) {
        // Only process data rows (skip headers and separators)
        if (lines[i].trim().startsWith('|') && !lines[i].includes('---') && !lines[i].includes('Catalogued |')) {
            // If row doesn't have a ✓, add it to the Catalogued column
            if (!lines[i].includes('✓')) {
                const parts = lines[i].split('|');
                // Assuming Catalogued is the last column
                if (parts.length > 4) {
                    parts[4] = ' ✓ ';
                    lines[i] = parts.join('|');
                    updated = true;
                    break; // Update one row per run to simulate partial progress
                }
            }
        }
    }

    if (updated) {
        fs.writeFileSync(manifestFile, lines.join('\\n'), 'utf8');
    }
}
// Emit stream-json format so runClaudeWithStreaming forwards the text
console.log(JSON.stringify({ event: { delta: { text: 'Fake claude executed' } } }));
`;
        writeFileSync(fakeClaudePath, fakeClaudeScript, 'utf8');
        chmodSync(fakeClaudePath, '755');
    });

    afterAll(() => {
        if (existsSync(testDir)) {
            import('fs').then(fs => fs.rmSync(testDir, { recursive: true, force: true }));
        }
    });

    it('should loop until all rows are catalogued for catalog-manifest workflow', () => {
        // Create an initial manifest with 2 uncatalogued rows
        const initialManifest = `| Identifier | Class | Layer | Catalogued |
|---|---|---|---|
| id1 | ClassA | Domain | |
| id2 | ClassB | Application | |
`;
        writeFileSync(manifestPath, initialManifest, 'utf8');

        // Path to cli-workflow and prompt
        const cliPath = join(process.cwd(), 'dist', 'cli-workflow.js');
        const catalogYamlPath = join(process.cwd(), 'dist', 'prompts', 'catalog-manifest.yml');

        // Build first to ensure dist/cli-workflow.js is up-to-date
        execSync('npm run build', { cwd: process.cwd(), stdio: 'ignore' });

        // Execute ddd-run script
        const env = { ...process.env, PATH: `${testDir}:${process.env.PATH}` };
        const cmd = `node "${cliPath}" "${catalogYamlPath}" --args '{"manifest_path": "${manifestPath}"}'`;

        const out = execSync(cmd, { env, encoding: 'utf8', stdio: 'pipe' });

        // Verify that claude ran at least twice
        expect(out.split('Fake claude executed').length).toBeGreaterThan(2);

        // Verify output messages
        expect(out).toContain('Cataloguing incomplete. 1 classes remaining');
        expect(out).toContain('Cataloguing complete! 0 uncatalogued classes remain.');

        // Verify final manifest content
        const finalManifest = readFileSync(manifestPath, 'utf8');
        expect(finalManifest).toContain('| id1 | ClassA | Domain | ✓ |');
        expect(finalManifest).toContain('| id2 | ClassB | Application | ✓ |');
    });

    it('should exit immediately for one-shot workflows', () => {
        // Create a dummy prompt that isn't catalog-manifest
        const dummyPromptPath = join(testDir, 'dummy-workflow.yml');
        const dummyPrompt = `name: dummy-workflow
description: just a test
arguments:
  - name: some_arg
    required: false
messages: |
  Do something
`;
        writeFileSync(dummyPromptPath, dummyPrompt, 'utf8');

        const cliPath = join(process.cwd(), 'dist', 'cli-workflow.js');
        const env = { ...process.env, PATH: `${testDir}:${process.env.PATH}` };
        const cmd = `node "${cliPath}" "${dummyPromptPath}"`;

        const out = execSync(cmd, { env, encoding: 'utf8', stdio: 'pipe' });

        // Should only run claude once and then finish
        expect(out.split('Fake claude executed').length).toBe(2); // Since string split by 'Fake claude executed' yields 2 parts if it appears once
        expect(out).not.toContain('classes remaining');

        unlinkSync(dummyPromptPath);
    });
});
