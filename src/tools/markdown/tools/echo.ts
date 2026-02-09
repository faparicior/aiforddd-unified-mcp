import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const echoTool: Tool = {
  name: "echo",
  description: "Echoes back the input text",
  inputSchema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "The message to echo back",
      },
    },
    required: ["message"],
  },
};

export async function handleEcho(args: Record<string, unknown>) {
  const message = args?.message as string;
  return {
    content: [
      {
        type: "text",
        text: `Echo: ${message}`,
      },
    ],
  };
}
