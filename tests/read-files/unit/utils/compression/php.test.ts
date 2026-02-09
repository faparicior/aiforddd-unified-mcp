import { describe, it, expect } from "vitest";
import { PhpCompressor } from "../../../../../src/tools/read-files/utils/compression/php.js";

describe("PHP Compression", () => {
    const compressor = new PhpCompressor();
    const compress = (code: string) => compressor.compress(code);

    it("should compress PHP code", () => {
        const original = `
            <?php
            
            $a = 5;
            $b = "hello";
            
            function test($x) {
                return $x . " world";
            }
            
            $arr = [
                'key' => 'value'
            ];
        `;
        const compressed = compress(original);
        expect(compressed).toContain("$a=5;");
        expect(compressed).toContain('function test($x){');
        expect(compressed).toContain('return $x." world"'); // Space around . likely matched by general cleanup \s*\.\s* -> .
        // Wait, general cleanup replaces " . " with "."
        // In PHP, " . " IS concat. So it becomes $x." world". This is valid PHP.
        expect(compressed).toContain("'key'=>'value'");
    });

    it("should preserve comments including hash", () => {
        const original = `
            <?php
            // One
            # Two
            /* Three */
        `;
        const compressed = compress(original);
        expect(compressed).toContain("// One");
        expect(compressed).toContain("# Two");
        expect(compressed).toContain("/* Three */");
    });
});
