// mcp-dependency-mapper/tests/unit/multi-language.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import { TypeScriptHandler } from '../../../src/tools/dependency-mapper/languages/typescript/TypeScriptHandler.js';
import { JavaHandler } from '../../../src/tools/dependency-mapper/languages/java/JavaHandler.js';
import { PhpHandler } from '../../../src/tools/dependency-mapper/languages/php/PhpHandler.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe("Multi-Language Support", () => {
  
  describe("TypeScript Handler", () => {
    const handler = new TypeScriptHandler();

    it("should extract imports from TypeScript content", () => {
      const content = `
        import { User } from './User';
        import * as utils from './utils';
        import './side-effect';
        const config = require('./config');
        
        export class UserService {}
      `;
      const deps = handler.extractDependencies(content, 'test.ts');
      expect(deps).toContain('./User');
      expect(deps).toContain('./utils');
      expect(deps).toContain('./side-effect');
      expect(deps).toContain('./config');
    });

    it("should identify interface files", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-test-'));
      const filePath = path.join(tempDir, 'IUser.ts');
      fs.writeFileSync(filePath, 'export interface IUser { id: string; }');
      
      const isInterface = await handler.isInterfaceFile(filePath);
      expect(isInterface).toBe(true);
    });
  });

  describe("Java Handler", () => {
    const handler = new JavaHandler();

    it("should extract imports from Java content", () => {
      const content = `
        package com.example;
        import java.util.List;
        import com.example.model.User;
        import com.example.service.UserService;
        
        public class UserController {
            // ...
        }
      `;
      const deps = handler.extractDependencies(content, 'test.java');
      expect(deps).toContain('com.example.model.User');
      expect(deps).toContain('com.example.service.UserService');
      // Should also contain standard lib if not filtered by extraction (filtering happens in resolution often, but let's check what implementation does)
      // The implementation extracts everything:
      expect(deps).toContain('java.util.List');
    });

    it("should detect same-package dependencies", () => {
      const content = `
        package com.example.domain;
        
        public class OrderService {
            public void process(Order order) {
                Helper.doSomething();
            }
        }
      `;
      const deps = handler.extractDependencies(content, 'test.java');
      // Order and Helper are capitalized and not imported -> assumed same package
      expect(deps).toContain('com.example.domain.Order');
      expect(deps).toContain('com.example.domain.Helper');
    });

    it("should identify interface files", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'java-test-'));
      const filePath = path.join(tempDir, 'IUser.java');
      fs.writeFileSync(filePath, 'public interface IUser { void save(); }');
      
      const isInterface = await handler.isInterfaceFile(filePath);
      expect(isInterface).toBe(true);
    });
  });

  describe("PHP Handler", () => {
    const handler = new PhpHandler();

    it("should extract use statements from PHP content", () => {
      const content = `
        <?php
        namespace App\\Service;
        
        use App\\Entity\\User;
        use App\\Repository\\UserRepository as UserRepo;
        
        class UserService {
            public function __construct(UserRepo $repo) {}
        }
      `;
      const deps = handler.extractDependencies(content, 'test.php');
      expect(deps).toContain('App\\Entity\\User');
      expect(deps).toContain('App\\Repository\\UserRepository');
    });

    it("should extract full qualified class usage in new", () => {
      const content = `
        <?php
        $d = new \\DateTime();
        $u = new \\App\\Utils\\Helper();
      `;
      const deps = handler.extractDependencies(content, 'test.php');
      expect(deps).toContain('App\\Utils\\Helper');
      // It captures standard classes too if prefixed with backslash
      expect(deps).toContain('DateTime');
    });

    it("should identify interface files", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'php-test-'));
      const filePath = path.join(tempDir, 'UserInterface.php');
      fs.writeFileSync(filePath, '<?php interface UserInterface {}');
      
      const isInterface = await handler.isInterfaceFile(filePath);
      expect(isInterface).toBe(true);
    });
  });

});
