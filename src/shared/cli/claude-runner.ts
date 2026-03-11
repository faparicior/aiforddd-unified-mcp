import { spawn } from 'child_process';

/**
 * Runs the Claude CLI with streaming JSON output, printing partial text
 * to stdout in real-time so the user sees progress while Claude is working.
 *
 * @param promptFile Absolute path to the temporary prompt file to feed to Claude.
 * @param extraFlags Additional Claude CLI flags (appended after the base flags).
 * @returns Exit code of the Claude process.
 */
export function runClaudeWithStreaming(promptFile: string, extraFlags: string = ''): Promise<number> {
    return new Promise((resolve, reject) => {
        const flags = `--dangerously-skip-permissions -p --output-format stream-json --verbose --include-partial-messages ${extraFlags}`.trim();
        const cmd = `cat "${promptFile}" | claude ${flags}`;

        const claudeProcess = spawn('sh', ['-c', cmd]);

        let lineBuffer = '';

        claudeProcess.stdout.on('data', (chunk: Buffer) => {
            lineBuffer += chunk.toString();
            const lines = lineBuffer.split('\n');
            lineBuffer = lines.pop() ?? '';

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.event?.delta?.text) {
                        process.stdout.write(json.event.delta.text);
                    }
                } catch {
                    // ignore malformed JSON lines
                }
            }
        });

        claudeProcess.stderr.on('data', (chunk: Buffer) => {
            process.stderr.write(chunk);
        });

        claudeProcess.on('close', (code) => {
            // flush any remaining partial line
            if (lineBuffer.trim()) {
                try {
                    const json = JSON.parse(lineBuffer);
                    if (json.event?.delta?.text) {
                        process.stdout.write(json.event.delta.text);
                    }
                } catch {
                    // ignore
                }
            }
            process.stdout.write('\n');
            resolve(code ?? 0);
        });

        claudeProcess.on('error', (err) => {
            reject(err);
        });
    });
}
