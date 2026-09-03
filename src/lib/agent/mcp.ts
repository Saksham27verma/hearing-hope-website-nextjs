import { listPublishedProducts } from "@/lib/catalog";
import { formatInr } from "@/lib/utils";
import { productHref } from "@/lib/urls";
import { getSiteSettings, listOpenClinics, listServices } from "@/lib/site-cms";
import { whatsappHref } from "@/lib/site";
import { originOf } from "@/lib/agent/urls";
import {
  handleMcpHandshake,
  jsonRpcError,
  jsonRpcResult,
  mcpCorsHeaders,
  mcpServerCard,
  type JsonRpcRequest,
} from "@/lib/agent/mcp-protocol";

export {
  initializeResult,
  MCP_TOOLS,
  mcpCorsHeaders,
  mcpServerCard,
  handleMcpHandshake,
} from "@/lib/agent/mcp-protocol";

function textResult(text: string) {
  return { content: [{ type: "text", text }] };
}

async function callTool(name: string, params: Record<string, unknown>) {
  const settings = await getSiteSettings();
  const base = originOf(settings.url);

  switch (name) {
    case "get_site_info":
      return textResult(
        JSON.stringify(
          {
            name: settings.name,
            legalName: settings.parentCompany,
            tagline: settings.tagline,
            description: settings.description,
            url: settings.url,
            email: settings.email,
            phone: settings.phoneDisplay,
            extraPhones: settings.extraPhones,
            whatsapp: whatsappHref(undefined, settings),
            address: settings.address,
            llmsTxt: `${base}/llms.txt`,
            contact: `${base}/contact`,
            developers: `${base}/developers`,
          },
          null,
          2,
        ),
      );
    case "list_clinics": {
      const clinics = await listOpenClinics();
      return textResult(
        JSON.stringify(
          clinics.map((clinic) => ({
            name: clinic.name,
            city: clinic.city,
            address: clinic.address,
            phone: clinic.phoneDisplay,
            hours: clinic.hours,
            lat: clinic.lat,
            lng: clinic.lng,
            blurb: clinic.blurb,
          })),
          null,
          2,
        ),
      );
    }
    case "list_hearing_aids": {
      let products = await listPublishedProducts();
      const brand = typeof params.brand === "string" ? params.brand.toLowerCase() : "";
      const type = typeof params.type === "string" ? params.type.toUpperCase() : "";
      const query = typeof params.query === "string" ? params.query.toLowerCase() : "";
      if (brand) {
        products = products.filter(
          (item) => item.brand.toLowerCase() === brand || item.brandSlug.toLowerCase() === brand,
        );
      }
      if (type) products = products.filter((item) => item.type === type);
      if (query) {
        products = products.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.brand.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query),
        );
      }
      return textResult(
        JSON.stringify(
          products.map((item) => ({
            name: item.name,
            brand: item.brand,
            type: item.type,
            mrp: item.mrp,
            mrpDisplay: formatInr(item.mrp),
            feature: item.feature,
            url: `${base}${productHref(item.slug)}`,
            inStock: item.inStock,
          })),
          null,
          2,
        ),
      );
    }
    case "list_services": {
      const services = await listServices();
      return textResult(
        JSON.stringify(
          services.map((service) => ({
            slug: service.slug,
            title: service.title,
            category: service.category,
            duration: service.duration,
            excerpt: service.excerpt,
            url: `${base}/services/${service.slug}`,
          })),
          null,
          2,
        ),
      );
    }
    case "get_booking_instructions":
      return textResult(
        JSON.stringify(
          {
            summary:
              "Hearing Hope does not persist bookings via API. Give the person these channels for a free first hearing test.",
            phone: settings.phoneDisplay,
            extraPhones: settings.extraPhones.map((item) => item.display),
            email: settings.email,
            whatsapp: whatsappHref(undefined, settings),
            contactPage: `${base}/contact`,
            homepageForm: `${base}/#book-test`,
            hours: "Walk-in clinics Monday–Saturday 10:00 AM–7:00 PM",
          },
          null,
          2,
        ),
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function handleMcpJsonRpc(payload: JsonRpcRequest) {
  const handshake = handleMcpHandshake(payload);
  if (handshake !== undefined) return handshake;

  const id = payload.id ?? null;
  const params = (payload.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
  const name = params.name ?? "";
  try {
    const result = await callTool(name, params.arguments ?? {});
    return jsonRpcResult(id, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool call failed";
    return jsonRpcError(id, -32602, message);
  }
}

export async function handleMcpPost(request: Request) {
  let payload: JsonRpcRequest;
  try {
    payload = (await request.json()) as JsonRpcRequest;
  } catch {
    return Response.json(jsonRpcError(null, -32700, "Parse error"), {
      status: 400,
      headers: { ...mcpCorsHeaders(), "Content-Type": "application/json" },
    });
  }

  const message = await handleMcpJsonRpc(payload);
  if (message === null) {
    return new Response(null, { status: 202, headers: mcpCorsHeaders() });
  }
  return Response.json(message, {
    headers: { ...mcpCorsHeaders(), "Content-Type": "application/json" },
  });
}

export function handleMcpOptions() {
  return new Response(null, { status: 204, headers: mcpCorsHeaders() });
}

export function handleMcpGetCard(origin?: string) {
  return Response.json(mcpServerCard(origin), {
    headers: {
      ...mcpCorsHeaders(),
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
    },
  });
}
