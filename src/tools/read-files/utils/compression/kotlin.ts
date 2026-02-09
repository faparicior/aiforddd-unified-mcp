import { BaseCompressor } from './base.js';

export class KotlinCompressor extends BaseCompressor {
    compress(content: string): string {
        this.protectedItems = [];
        
        // 1. Protect strings and comments in order of specificity
        const patterns = [
            /"""[\s\S]*?"""/g,   // Raw strings
            /"(?:[^"\\]|\\.)*"/g, // Regular strings
            /\/\*[\s\S]*?\*\//g,  // Multi-line comments
            /\/\/.*$/gm           // Single-line comments
        ];
        
        let compressed = this.protect(content, patterns);
        
        // 2. Initial whitespace compression
        compressed = compressed
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
            
        // 3. Kotlin specific: Merge consecutive imports
        let previousLength;
        do {
            previousLength = compressed.length;
            compressed = compressed.replace(
            /import\s+([a-zA-Z0-9_.]+)\.(\{[^}]+\}|[\w]+)\nimport\s+\1\.([\w]+)/g,
            (match, pkg, cls1, cls2) => {
                if (cls1.startsWith('{')) {
                const existing = cls1.slice(1, -1);
                return `import ${pkg}.{${existing},${cls2}}`;
                }
                return `import ${pkg}.{${cls1},${cls2}}`;
            }
            );
        } while (compressed.length < previousLength);

        // 4. Operator cleanup
        compressed = this.generalCleanup(compressed);
        
        // 5. Final whitespace collapse
        compressed = compressed
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');

        // 6. Restore
        return this.restore(compressed);
    }
}
