import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Error Handling", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should return error for unknown tool", async () => {
    const response = await client.callTool({
      name: "unknown_tool",
      arguments: {},
    });

    expect(response.isError).toBe(true);
    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe("text");
  });
});
