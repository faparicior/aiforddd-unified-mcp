import { BaseCompressor } from './base.js';
import { KotlinCompressor } from './kotlin.js';
import { JavaCompressor } from './java.js';
import { TypescriptCompressor } from './typescript.js';
import { PhpCompressor } from './php.js';
import * as path from 'path';

export function compressCode(content: string, filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    let compressor: BaseCompressor;
    
    switch (ext) {
        case '.kt':
        case '.kts':
            compressor = new KotlinCompressor();
            break;
        case '.java':
            compressor = new JavaCompressor();
            break;
        case '.ts':
        case '.tsx':
        case '.js': // JS is basically TS for compression purposes here
        case '.jsx':
            compressor = new TypescriptCompressor();
            break;
        case '.php':
            compressor = new PhpCompressor();
            break;
        default:
            // Fallback: just simple whitespace reduction? 
            // Or maybe just throw error if "compressed" tool is explicitly called on unsupported file.
            // But the tool definition says "Only works with .kt files" (which we will update).
            // For now, if we don't have a specific compressor, we might return original or throw.
            // The user request implies expanding support.
            // Let's default to no compression or basic whitespace if unknown?
            // Safer to throw or return as is if unknown, as aggressive compression breaks things.
            return content;
    }
    
    return compressor.compress(content);
}
