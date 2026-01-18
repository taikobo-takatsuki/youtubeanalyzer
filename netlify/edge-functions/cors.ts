import type { Config, Context } from "@netlify/edge-functions";

function parseAllowedOrigins(raw: string | null) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
}

export default async (request: Request, context: Context) => {
  const originRaw = request.headers.get("origin");
  const origin = originRaw ? normalizeOrigin(originRaw) : null;

  const envAllowed = parseAllowedOrigins(Netlify.env.get("ALLOWED_ORIGINS"));
  const siteUrl = context.site?.url ? normalizeOrigin(context.site.url) : null;

  const allowedOrigins = new Set<string>([
    ...envAllowed.map(normalizeOrigin),
    ...(siteUrl ? [siteUrl] : []),
  ]);

  if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    const res = new Response(null, { status: 204 });
    if (origin) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
      res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.headers.set("Access-Control-Max-Age", "86400");
    }
    return res;
  }

  const res = await context.next();

  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }

  return res;
};

export const config: Config = {
  path: "/api/*",
  rateLimit: {
    windowLimit: 60,
    windowSize: 600,
    aggregateBy: ["ip", "domain"],
  },
};
