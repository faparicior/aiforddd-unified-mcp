import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient, closeTestClient } from "../../fixtures/test-helpers.js";

describe("Echo Tool", () => {
  let client: Client;

  beforeAll(async () => {
    const setup = await createTestClient();
    client = setup.client;
  });

  afterAll(async () => {
    await closeTestClient(client);
  });

  it("should echo back a simple message", async () => {
    const response = await client.callTool({
      name: "echo",
      arguments: {
        message: "Hello, MCP!",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0]).toMatchObject({
      type: "text",
      text: "Echo: Hello, MCP!",
    });
  });

  it("should echo back an empty message", async () => {
    const response = await client.callTool({
      name: "echo",
      arguments: {
        message: "",
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0]).toMatchObject({
      type: "text",
      text: "Echo: ",
    });
  });

  it("should echo back a message with special characters", async () => {
    const specialMessage = "Test with special chars: @#$%^&*()_+{}[]|\\:\";<>?,./";
    const response = await client.callTool({
      name: "echo",
      arguments: {
        message: specialMessage,
      },
    });

    expect(response.content).toBeDefined();
    expect(Array.isArray(response.content)).toBe(true);
    const content = response.content as Array<{ type: string; text: string }>;
    expect(content.length).toBe(1);
    expect(content[0]).toMatchObject({
      type: "text",
      text: `Echo: ${specialMessage}`,
    });
  });
});
