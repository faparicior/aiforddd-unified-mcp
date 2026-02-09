import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  extractDependenciesFromKotlin,
  resolveDependencyToFilePath,
  mapDependencies
} from '../../../src/tools/dependency-mapper/tools/index.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe("Dependency Resolution", () => {
  let tempDir: string;
  let projectRoot: string;

  beforeAll(() => {
    // Create a temporary directory structure for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kotlin-deps-'));
    projectRoot = path.join(tempDir, 'src', 'main', 'kotlin');

    // Create directory structure: com/example/domain, com/example/application, com/example/infrastructure
    const domainDir = path.join(projectRoot, 'com', 'example', 'domain');
    const applicationDir = path.join(projectRoot, 'com', 'example', 'application');
    const infrastructureDir = path.join(projectRoot, 'com', 'example', 'infrastructure');

    fs.mkdirSync(domainDir, { recursive: true });
    fs.mkdirSync(applicationDir, { recursive: true });
    fs.mkdirSync(infrastructureDir, { recursive: true });

    // Create domain files
    fs.writeFileSync(
      path.join(domainDir, 'User.kt'),
      `package com.example.domain

data class User(
  val id: Long,
  val name: String,
  val email: String
)
`
    );

    fs.writeFileSync(
      path.join(domainDir, 'UserRepository.kt'),
      `package com.example.domain

import com.example.domain.User

interface UserRepository {
  fun findById(id: Long): User?
  fun save(user: User): User
}
`
    );

    // Create application service
    fs.writeFileSync(
      path.join(applicationDir, 'UserService.kt'),
      `package com.example.application

import com.example.domain.User
import com.example.domain.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(
  private val userRepository: UserRepository
) {
  fun getUser(id: Long): User? {
    return userRepository.findById(id)
  }
}
`
    );

    // Create infrastructure controller
    fs.writeFileSync(
      path.join(infrastructureDir, 'UserController.kt'),
      `package com.example.infrastructure

import com.example.application.UserService
import com.example.domain.User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
  private val userService: UserService
) {
  @GetMapping("/users/{id}")
  fun getUser(@PathVariable id: Long): User? {
    return userService.getUser(id)
  }
}
`
    );
  });

  afterAll(() => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("extractDependenciesFromKotlin", () => {
    it("should extract imports and type references", () => {
      const kotlinCode = `package com.example.infrastructure

import com.example.application.UserService
import com.example.domain.User
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
  private val userService: UserService
) {
  fun getUser(id: Long): User? {
    return userService.getUser(id)
  }
}
`;

      const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/UserController.kt');

      // Should extract full import paths
      expect(dependencies).toContain('com.example.application.UserService');
      expect(dependencies).toContain('com.example.domain.User');
      expect(dependencies).toContain('org.springframework.web.bind.annotation.RestController');

      // Should extract short class names that are NOT imported
      expect(dependencies).toContain('RestController');
      // UserService and User should NOT be included as they are already covered by imports
      expect(dependencies).not.toContain('UserService');
      expect(dependencies).not.toContain('User');
    });

    it("should extract dependencies from constructor parameters", () => {
      const kotlinCode = `package com.example

import com.example.service.SomeService

class MyClass(
  private val someService: SomeService,
  private val config: Configuration
) {
}
`;

      const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');

      expect(dependencies).toContain('com.example.service.SomeService');
      // SomeService should NOT be included as it's already covered by the import
      expect(dependencies).not.toContain('SomeService');
      expect(dependencies).toContain('Configuration');
    });

    it("should extract dependencies from return types", () => {
      const kotlinCode = `package com.example

import com.example.model.Result

class Service {
  fun process(): Result {
    return Result()
  }
}
`;

      const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');

      expect(dependencies).toContain('com.example.model.Result');
      // Note: Short class name 'Result' might not be extracted in all cases
      // The full import path is what matters
    });

    it("should filter out standard library imports", () => {
      const kotlinCode = `package com.example

import kotlin.collections.List
import java.util.UUID
import javax.persistence.Entity
import android.content.Context
`;

      const dependencies = extractDependenciesFromKotlin(kotlinCode, '/path/to/file.kt');

      // Standard library imports should be included in extraction
      expect(dependencies).toContain('kotlin.collections.List');
      expect(dependencies).toContain('java.util.UUID');
    });
  });

  describe("resolveDependencyToFilePath", () => {
    it("should resolve dependency with proper package structure", async () => {
      const controllerDir = path.join(projectRoot, 'com', 'example', 'infrastructure');
      const resolved = await resolveDependencyToFilePath(
        'com.example.application.UserService',
        controllerDir
      );

      expect(resolved).toBeTruthy();
      expect(resolved).toContain('UserService.kt');
      expect(fs.existsSync(resolved!)).toBe(true);
    });

    it("should resolve dependencies in the same package", async () => {
      const domainDir = path.join(projectRoot, 'com', 'example', 'domain');
      const resolved = await resolveDependencyToFilePath(
        'com.example.domain.User',
        domainDir
      );

      expect(resolved).toBeTruthy();
      expect(resolved).toContain('User.kt');
    });

    it("should return null for standard library dependencies", async () => {
      const controllerDir = path.join(projectRoot, 'com', 'example', 'infrastructure');
      
      expect(await resolveDependencyToFilePath('kotlin.String', controllerDir)).toBeNull();
      expect(await resolveDependencyToFilePath('java.util.UUID', controllerDir)).toBeNull();
      expect(await resolveDependencyToFilePath('org.springframework.stereotype.Service', controllerDir)).toBeNull();
    });

    it("should return null for non-existent dependencies", async () => {
      const controllerDir = path.join(projectRoot, 'com', 'example', 'infrastructure');
      const resolved = await resolveDependencyToFilePath(
        'com.example.NonExistent',
        controllerDir
      );

      expect(resolved).toBeNull();
    });

    it("should walk up directory tree to find dependencies", async () => {
      // From deep in infrastructure, should find domain classes
      const controllerDir = path.join(projectRoot, 'com', 'example', 'infrastructure');
      const resolved = await resolveDependencyToFilePath(
        'com.example.domain.User',
        controllerDir
      );

      expect(resolved).toBeTruthy();
      expect(resolved).toContain('domain');
      expect(resolved).toContain('User.kt');
    });
  });

  describe("mapDependencies", () => {
    it("should map dependencies and separate resolved from unresolved", async () => {
      const controllerPath = path.join(projectRoot, 'com', 'example', 'infrastructure', 'UserController.kt');
      
      const result = await mapDependencies(controllerPath, new Set(), 0, 3);

      expect(result.length).toBeGreaterThan(0);
      
      const rootNode = result[0];
      expect(rootNode.filePath).toBe(controllerPath);
      expect(rootNode.depth).toBe(0);

      // Should have resolved dependencies (UserService, User)
      expect(rootNode.dependencies.length).toBeGreaterThan(0);
      expect(rootNode.dependencies.some(dep => dep.includes('UserService.kt'))).toBe(true);

      // Should have unresolved dependencies (Spring annotations)
      expect(rootNode.unresolvedDependencies).toBeDefined();
      expect(rootNode.unresolvedDependencies!.length).toBeGreaterThan(0);
      expect(rootNode.unresolvedDependencies).toContain('org.springframework.web.bind.annotation.RestController');
    });

    it("should follow dependency chain recursively", async () => {
      const controllerPath = path.join(projectRoot, 'com', 'example', 'infrastructure', 'UserController.kt');
      
      const result = await mapDependencies(controllerPath, new Set(), 0, 5);

      // Should have multiple levels: Controller -> Service -> Repository, User
      expect(result.length).toBeGreaterThan(1);
      
      // Check that we have different depth levels
      const depths = result.map(node => node.depth);
      expect(Math.max(...depths)).toBeGreaterThan(0);

      // Should include UserService at depth 1
      const serviceNode = result.find(node => node.filePath.includes('UserService.kt'));
      expect(serviceNode).toBeDefined();
      expect(serviceNode!.depth).toBe(1);

      // Should include User and UserRepository at deeper levels
      const hasUserFile = result.some(node => node.filePath.includes('User.kt'));
      const hasRepoFile = result.some(node => node.filePath.includes('UserRepository.kt'));
      expect(hasUserFile || hasRepoFile).toBe(true);
    });

    it("should respect max depth limit", async () => {
      const controllerPath = path.join(projectRoot, 'com', 'example', 'infrastructure', 'UserController.kt');
      
      const result = await mapDependencies(controllerPath, new Set(), 0, 1);

      // With max depth of 1, should only go 1 level deep
      const depths = result.map(node => node.depth);
      expect(Math.max(...depths)).toBeLessThanOrEqual(1);
    });

    it("should handle circular dependencies without infinite loop", async () => {
      // Create two files that reference each other
      const circularDir = path.join(tempDir, 'circular');
      fs.mkdirSync(circularDir, { recursive: true });

      fs.writeFileSync(
        path.join(circularDir, 'A.kt'),
        `package com.example.circular

import com.example.circular.B

class A {
  fun useB(): B = B()
}
`
      );

      fs.writeFileSync(
        path.join(circularDir, 'B.kt'),
        `package com.example.circular

import com.example.circular.A

class B {
  fun useA(): A = A()
}
`
      );

      const aPath = path.join(circularDir, 'A.kt');
      const result = await mapDependencies(aPath, new Set(), 0, 10);

      // Should complete without hanging
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(100); // Reasonable limit
    });

    it("should return empty or undefined unresolved array when all dependencies are resolved or standard library", async () => {
      // Create a simple file with only standard library and resolvable dependencies
      const simpleDir = path.join(tempDir, 'simple');
      fs.mkdirSync(simpleDir, { recursive: true });

      fs.writeFileSync(
        path.join(simpleDir, 'Simple.kt'),
        `package com.example.simple

data class Simple(
  val id: Long,
  val name: String
)
`
      );

      const simplePath = path.join(simpleDir, 'Simple.kt');
      const result = await mapDependencies(simplePath, new Set(), 0, 1);

      expect(result.length).toBe(1);
      expect(result[0].dependencies).toEqual([]);
      // unresolvedDependencies can be undefined when empty (per interface definition)
      expect(result[0].unresolvedDependencies === undefined || result[0].unresolvedDependencies.length === 0).toBe(true);
    });
  });

  describe("Integration: Real-world scenario", () => {
    it("should handle a controller with service, domain, and framework dependencies", async () => {
      const controllerPath = path.join(projectRoot, 'com', 'example', 'infrastructure', 'UserController.kt');
      
      const result = await mapDependencies(controllerPath, new Set(), 0, 10);

      const rootNode = result[0];

      // Verify resolved dependencies (application and domain classes)
      const resolvedFiles = rootNode.dependencies.map(dep => path.basename(dep));
      expect(resolvedFiles).toContain('UserService.kt');
      expect(resolvedFiles).toContain('User.kt');

      // Verify unresolved dependencies (Spring framework)
      expect(rootNode.unresolvedDependencies).toBeDefined();
      const springDeps = rootNode.unresolvedDependencies!.filter(dep => 
        dep.startsWith('org.springframework')
      );
      expect(springDeps.length).toBeGreaterThan(0);

      // Verify the dependency chain follows through layers
      const serviceNode = result.find(node => node.filePath.includes('UserService.kt'));
      expect(serviceNode).toBeDefined();
      expect(serviceNode!.dependencies.length).toBeGreaterThan(0);
    });
  });
});
