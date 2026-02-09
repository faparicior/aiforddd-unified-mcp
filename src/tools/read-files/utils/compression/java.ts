import { BaseCompressor } from './base.js';

export class JavaCompressor extends BaseCompressor {
    compress(content: string): string {
        this.protectedItems = [];
        
        const patterns = [
            /"""[\s\S]*?"""/g,   // Text blocks (Java 13+)
            /"(?:[^"\\]|\\.)*"/g, // Strings
            /\/\*[\s\S]*?\*\//g,  // Multi-line comments
            /\/\/.*$/gm           // Single-line comments
        ];
        
        let compressed = this.protect(content, patterns);
        
        // Whitespace compression
        compressed = compressed
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        // Operator cleanup
        compressed = this.generalCleanup(compressed);
        
        // Final whitespace collapse
        compressed = compressed
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');

        return this.restore(compressed);
    }
}
