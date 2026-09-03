import { describe, expect, it } from "vitest";
import { handleMcpHandshake, initializeResult, MCP_TOOLS } from "@/lib/agent/mcp-protocol";

describe("MCP handshake", () => {
  it("answers initialize with serverInfo and tools capability", () => {
    const result = initializeResult("2025-03-26");
    expect(result.protocolVersion).toBe("2025-03-26");
    expect(result.serverInfo.name).toBe("hearing-hope");
    expect(result.capabilities.tools).toBeTruthy();
  });

  it("returns JSON-RPC initialize and tools/list shapes", () => {
    const initialized = handleMcpHandshake({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    expect(initialized).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: { serverInfo: { name: "hearing-hope" } },
    });

    const listed = handleMcpHandshake({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    expect(listed).toMatchObject({ jsonrpc: "2.0", id: 2 });
    const names = (listed as { result: { tools: { name: string }[] } }).result.tools.map((tool) => tool.name);
    expect(names).toEqual(MCP_TOOLS.map((tool) => tool.name));
  });
});
