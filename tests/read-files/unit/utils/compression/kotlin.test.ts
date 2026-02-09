import { describe, it, expect } from "vitest";
import { KotlinCompressor } from "../../../../../src/tools/read-files/utils/compression/kotlin.js";

describe("Kotlin Compression", () => {
  const compressor = new KotlinCompressor();
  const compress = (code: string) => compressor.compress(code);

  it("should compress Kotlin code by removing extra whitespace", () => {
    const original = `
      package com.example.math

      import com.example.math.operations.Add
      import com.example.math.operations.Subtract

      class MathService {
          fun calculate(x: Int, y: Int): Int {
              return x + y
          }
      }
    `;

    const compressed = compress(original);
    
    expect(compressed).toContain("package com.example.math");
    expect(compressed).toContain("import com.example.math.operations.{Add,Subtract}");
    expect(compressed).toContain("class MathService");
    expect(compressed).toContain("fun calculate(x:Int,y:Int)");
    // Space preserved because '+' can be ambiguous or just not handled by cleanup
    expect(compressed).toContain("return x + y"); 
    
    expect(compressed.length).toBeLessThan(original.length);
  });

  it("should preserve all identifiers and structure", () => {
    const original = `
      package com.example.service

      import com.example.domain.Entity
      import com.example.domain.EntityId

      class DataService(private val repository: DataRepository) {
        private val logger = LoggerFactory.getLogger(DataService::class.java)

        fun process(request: DataRequest) {
          runCatching {
            logger.info("[DataService] Processing: \${request.id}")
            request.toEntity().let(repository::save)
          }.onFailure {
            logger.error("[DataService] \${it.message}", it)
            throw it
          }
        }
      }
    `;

    const compressed = compress(original);
    
    expect(compressed).toContain("package com.example.service");
    expect(compressed).toContain("import com.example.domain.{Entity,EntityId}");
    expect(compressed).toContain("class DataService");
    expect(compressed).toContain("DataRepository");
    expect(compressed).toContain("LoggerFactory");
    expect(compressed).toContain("fun process");
    expect(compressed).toContain("DataRequest");
    expect(compressed).toContain("runCatching");
    expect(compressed).toContain("onFailure");
  });

  it("should merge consecutive imports from same package", () => {
    const original = `
      import com.example.models.Product
      import com.example.models.ProductId
      import com.example.services.ProductService
      import java.time.LocalDate
      import java.time.Instant
    `;

    const compressed = compress(original);
    
    expect(compressed).toContain("import com.example.models.{Product,ProductId}");
    expect(compressed).toContain("import com.example.services.ProductService");
    expect(compressed).toContain("import java.time.{LocalDate,Instant}");
  });

  it("should handle empty lines and whitespace", () => {
    const original = `
      
      
      class Test {
        
        
        fun method() {
          
        }
        
        
      }
      
      
    `;

    const compressed = compress(original);
    
    expect(compressed).toContain("class Test{");
    expect(compressed).toContain("fun method()");
    expect(compressed).not.toContain("\n\n\n");
  });
});
