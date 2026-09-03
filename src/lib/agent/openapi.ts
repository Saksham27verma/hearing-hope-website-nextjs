import { site } from "@/lib/site";
import { originOf } from "@/lib/agent/urls";
import { MCP_TOOLS } from "@/lib/agent/mcp-protocol";

export function openApiSpec(origin: string = site.url) {
  const base = originOf(origin);
  return {
    openapi: "3.1.0",
    info: {
      title: "Hearing Hope developer API",
      description:
        "Public, unauthenticated discovery endpoints for Hearing Hope (audiology clinics in India). Use markdown negotiation on HTML pages, /llms.txt for agent guidance, and MCP for structured lookups.",
      version: "0.1.0",
      contact: {
        name: "Hearing Hope",
        email: site.email,
        url: `${base}/contact`,
      },
    },
    servers: [{ url: base, description: "Hearing Hope canonical origin" }],
    paths: {
      "/llms.txt": {
        get: {
          summary: "Agent instruction file",
          operationId: "getLlmsTxt",
          responses: {
            "200": {
              description: "llms.txt v2 markdown",
              content: { "text/markdown": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/.well-known/mcp": {
        get: {
          summary: "MCP server card",
          operationId: "getMcpServerCard",
          responses: { "200": { description: "JSON server card for Streamable HTTP" } },
        },
        post: {
          summary: "MCP JSON-RPC handshake at the well-known URL",
          operationId: "postWellKnownMcp",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { "200": { description: "JSON-RPC response" } },
        },
      },
      "/mcp": {
        post: {
          summary: "Hearing Hope MCP Streamable HTTP endpoint",
          operationId: "postMcp",
          description: `Tools: ${MCP_TOOLS.map((tool) => tool.name).join(", ")}`,
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { "200": { description: "JSON-RPC response" } },
        },
      },
      "/contact": {
        get: {
          summary: "Hearing Hope contact and NAP page",
          operationId: "getContact",
          responses: { "200": { description: "HTML or markdown via Accept" } },
        },
      },
    },
  };
}
