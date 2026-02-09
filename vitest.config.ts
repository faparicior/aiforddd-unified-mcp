import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'tests/',
        'config/',
      ],
    },
  },
  resolve: {
    alias: {
      // Create aliases to help map old imports to new structure if possible
      // But imports are relative "../../../src", so aliases might not help unless I change the files to use aliases.
    }
  }
});
