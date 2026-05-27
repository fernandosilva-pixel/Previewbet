/**
 * Proxy reverso para o backend FastAPI.
 *
 * Todas as chamadas do front para /api/backend/** são encaminhadas para
 * BACKEND_URL/api/** (variável server-side, lida em runtime — não precisa rebuild).
 *
 * Exemplo:
 *   browser → GET /api/backend/games/
 *   Next.js → GET https://previewbet-production.up.railway.app/api/games/
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = (
  process.env.BACKEND_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const search = req.nextUrl.search ?? "";
  const target = `${BACKEND}/${path}${search}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Repassa Authorization se presente
    const auth = req.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      // Passa body para POST/PUT/PATCH
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    };

    const upstream = await fetch(target, fetchOptions);
    const text = await upstream.text();

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch (err) {
    console.error("[proxy] Backend unreachable:", target, err);
    return NextResponse.json(
      { error: "Backend indisponível", backend: BACKEND },
      { status: 503 }
    );
  }
}

export const GET     = proxy;
export const POST    = proxy;
export const PUT     = proxy;
export const PATCH   = proxy;
export const DELETE  = proxy;
