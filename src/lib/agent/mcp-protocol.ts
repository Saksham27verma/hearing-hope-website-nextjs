import { site } from "@/lib/site";
import { originOf } from "@/lib/agent/urls";

export const PROTOCOL_VERSION = "2025-03-26";
const SUPPORTED_VERSIONS = new Set(["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"]);

export const MCP_TOOLS = [
  {
    name: "get_site_info",
    description:
      "Return Hearing Hope identity: legal name, phones, email, WhatsApp, address, and canonical URLs for agents.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_clinics",
    description: "List open Hearing Hope walk-in clinics in Delhi NCR with address, phone, hours and coordinates.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_hearing_aids",
    description: "List published hearing aids with brand, type, listed MRP and product URL. Optional brand, type, or text query.",
    inputSchema: {
      type: "object",
      properties: {
        brand: { type: "string", description: "Brand name such as Signia or Phonak" },
        type: { type: "string", description: "Style code: RIC, BTE, ITC, CIC, IIC, ITE" },
        query: { type: "string", description: "Case-insensitive name, brand or type search" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_services",
    description: "List Hearing Hope clinical services such as PTA, OAE, BERA, hearing-aid fitting and speech therapy.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_booking_instructions",
    description:
      "How a person books a free Hearing Hope hearing test. There is no write API; return phone, WhatsApp and /contact.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
] as const;

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
};

export function mcpCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, Mcp-Method, Mcp-Name",
    "Access-Control-Max-Age": "86400",
  };
}

export function mcpServerCard(origin: string = site.url) {
  const base = originOf(origin);
  return {
    mcp_version: PROTOCOL_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    server_name: "Hearing Hope",
    serverInfo: {
      name: "hearing-hope",
      title: "Hearing Hope",
      version: "0.1.0",
      description:
        "Read-only MCP tools for Hearing Hope clinics, hearing aids, clinical services and booking channels in India.",
      website: base,
    },
    endpoints: {
      streamable_http: `${base}/mcp`,
    },
    transport: {
      type: "streamable-http",
      url: `${base}/mcp`,
    },
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    authentication: {
      required: false,
      methods: [],
    },
    documentation: `${base}/developers`,
    privacy_policy: `${base}/privacy`,
  };
}

export function initializeResult(requestedVersion?: string) {
  const protocolVersion =
    requestedVersion && SUPPORTED_VERSIONS.has(requestedVersion) ? requestedVersion : PROTOCOL_VERSION;
  return {
    protocolVersion,
    capabilities: {
      tools: { listChanged: false },
    },
    serverInfo: {
      name: "hearing-hope",
      title: "Hearing Hope",
      version: "0.1.0",
    },
    instructions:
      "Use Hearing Hope tools to look up Delhi NCR clinics, hearing-aid catalogue facts, services, and how a person books a free hearing test. Do not claim a booking was stored.",
  };
}

export function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}

export function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

export function handleMcpHandshake(payload: JsonRpcRequest) {
  const id = payload.id ?? null;
  const method = payload.method ?? "";
  const isNotification = payload.id === undefined;

  if (isNotification) return null;

  if (method === "initialize") {
    const params = (payload.params ?? {}) as { protocolVersion?: string };
    return jsonRpcResult(id, initializeResult(params.protocolVersion));
  }

  if (method === "ping") {
    return jsonRpcResult(id, {});
  }

  if (method === "tools/list") {
    return jsonRpcResult(id, { tools: MCP_TOOLS });
  }

  if (method === "tools/call") {
    return undefined;
  }

  return jsonRpcError(id, -32601, `Method not found: ${method}`);
}
