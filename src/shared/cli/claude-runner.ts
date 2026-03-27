import { spawn } from 'child_process';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import { join, dirname } from 'path';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes without any output

function getDebugLogStream(promptFile: string): WriteStream | undefined {
    if (process.env['AIFORDDD_CLAUDE_DEBUG'] !== '1') return undefined;
    const logDir = join(dirname(promptFile), '.claude-debug-logs');
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = join(logDir, `claude-stream-${timestamp}.jsonl`);
    console.error(`[DEBUG] Claude raw stream log: ${logFile}`);
    return createWriteStream(logFile, { flags: 'a' });
}

/**
 * Runs the Claude CLI with streaming JSON output, printing partial text
 * to stdout in real-time so the user sees progress while Claude is working.
 *
 * Includes an inactivity timeout: if no output (stdout or stderr) is received
 * for INACTIVITY_TIMEOUT_MS, the Claude process is killed to avoid indefinite hangs.
 *
 * @param promptFile Absolute path to the temporary prompt file to feed to Claude.
 * @param extraFlags Additional Claude CLI flags (appended after the base flags).
 * @returns Exit code of the Claude process.
 */
export function runClaudeWithStreaming(promptFile: string, extraFlags: string = ''): Promise<number> {
    return new Promise((resolve, reject) => {
        const flags = `--dangerously-skip-permissions -p --output-format stream-json --verbose --include-partial-messages ${extraFlags}`.trim();
        const cmd = `cat "${promptFile}" | claude ${flags}`;

        const debugLog = getDebugLogStream(promptFile);
        if (debugLog) {
            debugLog.write(`--- CMD: ${cmd}\n--- PROMPT FILE: ${promptFile}\n--- STARTED: ${new Date().toISOString()}\n`);
        }

        const claudeProcess = spawn('sh', ['-c', cmd]);

        // Close stdin immediately — Claude gets input via `cat file |`, not from stdin
        claudeProcess.stdin.end();

        let lineBuffer = '';
        let settled = false;

        // Inactivity watchdog: kill the process if no output for too long
        let inactivityTimer: ReturnType<typeof setTimeout> | undefined;

        function resetInactivityTimer() {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (settled) return;
                const msg = `\nClaude CLI inactivity timeout (${INACTIVITY_TIMEOUT_MS / 1000}s without output). Killing process.`;
                console.error(msg);
                debugLog?.write(`--- TIMEOUT: ${msg}\n`);
                claudeProcess.kill('SIGTERM');
                // Give it a moment to exit gracefully, then force-kill
                setTimeout(() => {
                    try { claudeProcess.kill('SIGKILL'); } catch { /* already dead */ }
                }, 5000);
            }, INACTIVITY_TIMEOUT_MS);
        }

        resetInactivityTimer();

        claudeProcess.stdout.on('data', (chunk: Buffer) => {
            resetInactivityTimer();
            const raw = chunk.toString();
            debugLog?.write(raw);
            lineBuffer += raw;
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
            resetInactivityTimer();
            const raw = chunk.toString();
            debugLog?.write(`--- STDERR: ${raw}`);
            process.stderr.write(chunk);
        });

        claudeProcess.on('close', (code) => {
            settled = true;
            if (inactivityTimer) clearTimeout(inactivityTimer);
            debugLog?.write(`\n--- CLOSED: code=${code} at ${new Date().toISOString()}\n`);
            debugLog?.end();
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
            settled = true;
            if (inactivityTimer) clearTimeout(inactivityTimer);
            debugLog?.write(`\n--- ERROR: ${err.message}\n`);
            debugLog?.end();
            reject(err);
        });
    });
}
