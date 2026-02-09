import { describe, it, expect } from "vitest";
import { JavaCompressor } from "../../../../../src/tools/read-files/utils/compression/java.js";

describe("Java Compression", () => {
  const compressor = new JavaCompressor();
  const compress = (code: string) => compressor.compress(code);

  it("should compress Java code by removing extra whitespace", () => {
    const original = `
      package com.example.math;

      import com.example.math.operations.Add;
      import com.example.math.operations.Subtract;

      public class MathService {
          public int calculate(int x, int y) {
              return x + y;
          }
      }
    `;

    const compressed = compress(original);
    
    expect(compressed).toContain("package com.example.math;");
    // Java compressor does NOT merge imports
    expect(compressed).toContain("import com.example.math.operations.Add;");
    expect(compressed).toContain("import com.example.math.operations.Subtract;");
    expect(compressed).toContain("public class MathService{");
    expect(compressed).toContain("public int calculate(int x,int y)");
    expect(compressed).toContain("return x + y;");
    
    expect(compressed.length).toBeLessThan(original.length);
  });

  it("should preserve strings", () => {
    const original = `
      public class Test {
          String s = "Hello   World";
          String s2 = "Value: " + 123;
      }
    `;
    const compressed = compress(original);
    expect(compressed).toContain('"Hello   World"');
    expect(compressed).toContain('"Value: "');
  });

  it("should preserve comments", () => {
     const original = `
      // Single line comment
      /* Multi
         line
         comment */
      public class Test {}
    `;
    const compressed = compress(original);
    expect(compressed).toContain("// Single line comment");
    expect(compressed).toContain("/* Multi");
    expect(compressed).toContain("comment */");
  });
});
