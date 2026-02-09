import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestClient, closeTestClient } from "../fixtures/test-helpers.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { readFileSync } from "fs";
import { join } from "path";

describe("Bounded Context Canvas Editor MCP Server", () => {
  let client: Client;

  beforeEach(async () => {
    const { client: testClient } = await createTestClient();
    client = testClient;
  });

  afterEach(async () => {
    await closeTestClient(client);
  });

  it("should list available tools", async () => {
    const tools = await client.listTools();
    expect(tools.tools).toBeDefined();
    expect(tools.tools.length).toBeGreaterThan(0);

    const toolNames = tools.tools.map(tool => tool.name);
    expect(toolNames).toContain("parse_bounded_context_canvas");
    expect(toolNames).toContain("update_context_name");
    expect(toolNames).toContain("update_context_purpose");
    expect(toolNames).toContain("update_strategic_classification");
    expect(toolNames).toContain("update_domain_roles");
  });

  it("should parse a bounded context canvas", async () => {
    const testFilePath = join(process.cwd(), "tests/bounded-context-canvas/fixtures/test-canvas.md");

    const result = await client.callTool({
      name: "parse_bounded_context_canvas",
      arguments: {
        filePath: testFilePath,
      },
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.name).toBe("Test Context");
    expect(parsed.purpose).toBe("A test bounded context for development");
    expect(parsed.strategicClassification.domainType).toBe("Core");
    expect(parsed.strategicClassification.businessModel).toBe("Revenue Generator");
    expect(parsed.strategicClassification.evolutionStage).toBe("Product");
    expect(parsed.domainRoles).toEqual(["Domain Expert", "Product Owner", "Developer"]);
  });
});