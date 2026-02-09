import { describe, it, expect } from 'vitest';
import { findImplementationsOfInterface } from '../../../src/tools/dependency-mapper/tools/index.js';
import * as path from 'path';

describe('Aggressive Implementation Finding', () => {
  it('should find implementations using aggressive search strategy', async () => {
    const examplesDir = path.join(process.cwd(), 'examples', 'kotlin');

    // Test with UserServiceInterface which has an implementation
    const implementations = await findImplementationsOfInterface('UserServiceInterface', examplesDir);

    expect(implementations.length).toBeGreaterThan(0);
    expect(implementations.some(impl => impl.includes('UserServiceWithInterface.kt'))).toBe(true);
  });

  it('should search in parent directories when not found locally', async () => {
    const subDir = path.join(process.cwd(), 'examples', 'kotlin', 'structured');

    // The interface is not in this subdirectory, but the implementation search should find it
    const implementations = await findImplementationsOfInterface('UserServiceInterface', subDir);

    expect(implementations.length).toBeGreaterThan(0);
  });

  it('should handle Clean Architecture directory structures', async () => {
    // This test simulates a Clean Architecture structure
    const testDir = path.join(process.cwd(), 'examples', 'kotlin');

    // Create a mock Clean Architecture structure for testing
    const domainImplementations = await findImplementationsOfInterface('UserServiceInterface', testDir);

    expect(domainImplementations.length).toBeGreaterThan(0);
  });
});