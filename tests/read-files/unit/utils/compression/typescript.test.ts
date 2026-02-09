import { describe, it, expect } from "vitest";
import { TypescriptCompressor } from "../../../../../src/tools/read-files/utils/compression/typescript.js";

describe("Typescript Compression", () => {
    const compressor = new TypescriptCompressor();
    const compress = (code: string) => compressor.compress(code);

    it("should compress TS code", () => {
        const original = `
            import { A, B } from 'lib';
            
            interface User {
                name: string;
                age: number;
            }

            const x = (a: number) => {
                return a * 2;
            }
        `;
        const compressed = compress(original);
        expect(compressed).toContain("import{A,B}from 'lib';");
        expect(compressed).toContain("interface User{");
        expect(compressed).toContain("name:string;");
        expect(compressed).toContain("const x=(a:number)=>");
    });

    it("should preserve strings with different quotes", () => {
        const original = `
            const a = "double";
            const b = 'single';
            const c = \`template
            string\`;
        `;
        const compressed = compress(original);
        expect(compressed).toContain('"double"');
        expect(compressed).toContain("'single'");
        expect(compressed).toContain("`template");
        expect(compressed).toContain("string`");
    });
});
