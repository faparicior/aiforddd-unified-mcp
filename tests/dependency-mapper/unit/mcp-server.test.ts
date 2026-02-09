import { describe, it, expect } from "vitest";
import {
  extractDependenciesFromKotlin
} from '../../../src/tools/dependency-mapper/tools/index.js';


describe("extractDependenciesFromKotlin", () => {
  it("should extract import statements", () => {
    const kotlinCode = `
package com.example

import com.example.utils.StringUtils
import com.example.models.User

class ExampleClass {
  // some code
}
`;

    const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');

    expect(dependencies).toContain('com.example.utils.StringUtils');
    expect(dependencies).toContain('com.example.models.User');
  });

  it("should extract class inheritance dependencies", () => {
    const kotlinCode = `
package com.example

class MyClass : BaseClass, SomeInterface {
  // implementation
}
`;

    const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');

    expect(dependencies).toContain('BaseClass');
    expect(dependencies).toContain('SomeInterface');
  });

  it("should handle empty files", () => {
    const dependencies = extractDependenciesFromKotlin('', '/path/to/file.kt');
    expect(dependencies).toEqual([]);
  });

  it("should handle files with no dependencies", () => {
    const kotlinCode = `
package com.example

class SimpleClass {
  val name: String = "test"
}
`;

    const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');
    expect(dependencies).toEqual([]);
  });
});
