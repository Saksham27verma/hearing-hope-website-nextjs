import { NextResponse, type NextRequest } from "next/server";
import { appendVaryAccept, notAcceptableBody, preferredType } from "@/lib/agent/accept";
import { isSupabaseConfigured } from "@/lib/env";
import { createProxySupabaseClient } from "@/lib/supabase/proxy";

function skipNegotiation(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname === "/mcp" ||
    pathname.startsWith("/.well-known") ||
    pathname === "/openapi.json" ||
    pathname === "/llms.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

function decoratePublicResponse(response: NextResponse, pathname: string) {
  appendVaryAccept(response.headers);
  response.headers.append("Vary", "Accept");
  response.headers.append("Link", '</llms.txt>; rel="describedby"');
  if (!pathname.endsWith(".md") && !skipNegotiation(pathname)) {
    const mdPath = pathname === "/" ? "/index.md" : `${pathname}.md`;
    response.headers.append("Link", `<${mdPath}>; rel="alternate"; type="text/markdown"`);
  }
  return response;
}

function rewriteToMarkdown(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  const withoutMd = pathname.endsWith(".md") ? pathname.slice(0, -3) || "/" : pathname;
  url.pathname = withoutMd === "/" ? "/api/markdown" : `/api/markdown${withoutMd}`;
  const rewritten = NextResponse.rewrite(url);
  appendVaryAccept(rewritten.headers);
  rewritten.headers.set("Vary", "Accept, Accept-Encoding");
  return rewritten;
}

function isRscRequest(request: NextRequest) {
  return (
    request.headers.has("rsc") ||
    request.headers.has("next-router-state-tree") ||
    (request.headers.get("accept") ?? "").includes("text/x-component")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (!isAdmin && !skipNegotiation(pathname) && !isRscRequest(request)) {
    if (pathname.endsWith(".md")) {
      return rewriteToMarkdown(request, pathname);
    }

    const acceptHeader = request.headers.get("accept");
    const chosen = preferredType(acceptHeader);

    if (chosen === "text/markdown") {
      return rewriteToMarkdown(request, pathname);
    }

    if (chosen === null && acceptHeader) {
      return new Response(notAcceptableBody(), {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
        },
      });
    }
  }

  if (!isAdmin) {
    return decoratePublicResponse(NextResponse.next({ request }), pathname);
  }

  if (!isSupabaseConfigured()) {
    if (isLogin) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const { supabase, response } = createProxySupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const next = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = next?.startsWith("/admin/") ? next : "/admin/products";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|_vercel/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|map)$).*)"],
};
