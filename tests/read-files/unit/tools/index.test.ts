import { describe, it, expect } from "vitest";
import { registerTools } from "../../../../src/tools/read-files/tools/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Tools Index", () => {
  it("should export a registerTools function", () => {
    expect(registerTools).toBeDefined();
    expect(typeof registerTools).toBe("function");
  });

  it("should accept an McpServer instance", () => {
    const server = new McpServer(
      { name: "test", version: "1.0.0" },
      { capabilities: {} }
    );

    expect(() => registerTools(server)).not.toThrow();
  });
});
