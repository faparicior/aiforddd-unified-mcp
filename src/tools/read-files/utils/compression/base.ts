
export interface CompressionOptions {
    removeComments?: boolean; // If we wanted to, but the requirement says "preserving all content", so comments should likely be kept but maybe minimized? The existing kotlin compressor seems to preserve them but placeholderize them during processing.
}

export abstract class BaseCompressor {
    protected protectedItems: string[] = [];

    protected protect(content: string, patterns: RegExp[]): string {
        let protectedContent = content;
        for (const pattern of patterns) {
            protectedContent = protectedContent.replace(pattern, (match) => {
                const index = this.protectedItems.length;
                this.protectedItems.push(match);
                return `__PROTECTED_${index}__`;
            });
        }
        return protectedContent;
    }

    protected restore(content: string): string {
        let restored = content;
        this.protectedItems.forEach((item, index) => {
             // Use a more specific replacement to avoid replacing suffixes of other tokens if strict matching isn't used.
             // However, __PROTECTED_X__ is quite specific.
             // We need to restore in order? Or just all.
             // The original code did strict replacement.
            restored = restored.replace(`__PROTECTED_${index}__`, item);
        });
        return restored;
    }

    protected compressWhitespace(content: string): string {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
            .replace(/\s+/g, ' ') // Collapse multiple spaces to single space
            .replace(/\n+/g, '\n'); // Clean up multiple newlines
    }
    
    protected generalCleanup(content: string): string {
         return content
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*\(\s*/g, '(')
            .replace(/\s*\)\s*/g, ')')
            .replace(/\s*,\s*/g, ',')
            .replace(/\s*=\s*/g, '=')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*->\s*/g, '->') 
            .replace(/\s*\.\s*/g, '.');
    }

    abstract compress(content: string): string;
}
