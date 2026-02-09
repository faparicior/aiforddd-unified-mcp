import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createTestClient(): Promise<{
  client: Client;
  transport: StdioClientTransport;
}> {
  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "node",
    args: ["build/mcp-server.js"],
  });

  await client.connect(transport);

  return { client, transport };
}

export async function closeTestClient(client: Client) {
  await client.close();
}