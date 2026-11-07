/**
 * Montano Flooring – quote requests → WhatsApp (Trello card 29).
 *
 * The site's form POSTs JSON here. This Worker:
 *  1. accepts only requests from the site's own origin (CORS),
 *  2. limits repeated submissions per visitor (anti-spam),
 *  3. validates every field (same rules as the form),
 *  4. sends a WhatsApp message to the owner through CallMeBot.
 * The CallMeBot key and phone live in Cloudflare secrets, never in the page.
 */

/** Cloudflare rate limiting binding (declared in wrangler.toml). */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  /** Owner's WhatsApp number with country code, e.g. +13135550142 (secret). */
  CALLMEBOT_PHONE: string;
  /** Key CallMeBot gave the owner (secret). */
  CALLMEBOT_APIKEY: string;
  /** Comma-separated origins allowed to post, e.g. https://luismrojas.github.io */
  ALLOWED_ORIGINS: string;
  QUOTE_LIMITER?: RateLimiter;
}

export interface QuoteRequest {
  name: string;
  phone: string;
  zip: string;
  flooringType: string;
  flooringLabel?: string;
  email?: string;
  sqft?: number;
  preferredDate?: string;
  preferredTime?: string;
  comments?: string;
  inServiceArea: boolean;
  language: 'en' | 'es';
}

const TIMES: Record<string, string> = {
  morning: 'mañana (8–12)',
  afternoon: 'tarde (12–4)',
  'late-afternoon': 'final de la tarde (4–6)',
};

const MAX_BODY_BYTES = 10_000;

// ---------- Validation ----------

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.trim().length <= max ? v.trim() : null;
}

/** Returns the clean request, or the name of the first invalid field. */
export function validate(body: unknown): { ok: true; value: QuoteRequest } | { ok: false; field: string } {
  if (!body || typeof body !== 'object') return { ok: false, field: 'body' };
  const b = body as Record<string, unknown>;

  const name = str(b['name'], 100);
  if (!name || name.length < 2) return { ok: false, field: 'name' };

  const phone = str(b['phone'], 30);
  const digits = (phone ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (!phone || digits.length !== 10) return { ok: false, field: 'phone' };

  const zip = str(b['zip'], 5);
  if (!zip || !/^\d{5}$/.test(zip)) return { ok: false, field: 'zip' };

  const flooringType = str(b['flooringType'], 50);
  if (!flooringType || !/^[a-z0-9-]+$/.test(flooringType)) return { ok: false, field: 'flooringType' };

  const flooringLabel = b['flooringLabel'] === undefined ? undefined : str(b['flooringLabel'], 80);
  if (flooringLabel === null) return { ok: false, field: 'flooringLabel' };

  const email = b['email'] === undefined ? undefined : str(b['email'], 200);
  if (email === null || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { ok: false, field: 'email' };

  const sqft = b['sqft'];
  if (sqft !== undefined && !(Number.isInteger(sqft) && (sqft as number) >= 1 && (sqft as number) <= 100_000)) {
    return { ok: false, field: 'sqft' };
  }

  const preferredDate = b['preferredDate'] === undefined ? undefined : str(b['preferredDate'], 10);
  if (preferredDate === null || (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate))) {
    return { ok: false, field: 'preferredDate' };
  }

  const preferredTime = b['preferredTime'];
  if (preferredTime !== undefined && !(typeof preferredTime === 'string' && preferredTime in TIMES)) {
    return { ok: false, field: 'preferredTime' };
  }

  const comments = b['comments'] === undefined ? undefined : str(b['comments'], 1000);
  if (comments === null) return { ok: false, field: 'comments' };

  if (typeof b['inServiceArea'] !== 'boolean') return { ok: false, field: 'inServiceArea' };
  if (b['language'] !== 'en' && b['language'] !== 'es') return { ok: false, field: 'language' };

  return {
    ok: true,
    value: {
      name,
      phone,
      zip,
      flooringType,
      flooringLabel,
      email,
      sqft: sqft as number | undefined,
      preferredDate,
      preferredTime: preferredTime as string | undefined,
      comments,
      inServiceArea: b['inServiceArea'] as boolean,
      language: b['language'] as 'en' | 'es',
    },
  };
}

// ---------- Message ----------

/** WhatsApp text for the owner (in Spanish). */
export function formatMessage(q: QuoteRequest): string {
  const lines = [
    '🟫 *Nueva solicitud de estimado*',
    `👤 Nombre: ${q.name}`,
    `📞 Teléfono: ${q.phone}`,
    `📍 ZIP: ${q.zip} (${q.inServiceArea ? 'dentro de la zona' : '⚠️ FUERA de la zona'})`,
    `🪵 Piso / servicio: ${q.flooringType === 'not-sure' ? 'Aún no sabe' : (q.flooringLabel ?? q.flooringType)}`,
  ];
  if (q.email) lines.push(`✉️ Email: ${q.email}`);
  if (q.sqft) lines.push(`📐 Pies²: ${q.sqft.toLocaleString('en-US')}`);
  if (q.preferredDate || q.preferredTime) {
    const when = [q.preferredDate, q.preferredTime ? TIMES[q.preferredTime] : null].filter(Boolean).join(', ');
    lines.push(`📅 Preferencia: ${when}`);
  }
  if (q.comments) lines.push(`💬 Comentarios: ${q.comments}`);
  lines.push(`🌐 Idioma del cliente: ${q.language === 'es' ? 'español' : 'inglés'}`);
  return lines.join('\n');
}

// ---------- HTTP ----------

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status: number, data: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export async function sendWhatsApp(text: string, env: Env, fetcher: typeof fetch = fetch): Promise<boolean> {
  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', env.CALLMEBOT_PHONE);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', env.CALLMEBOT_APIKEY);
  const res = await fetcher(url.toString());
  const body = await res.text();
  // CallMeBot answers 200 with an HTML page; problems are reported in the text
  // (e.g. "APIKey is invalid"). Only those explicit messages count as failure.
  return res.ok && !/apikey is invalid|not authorized|error:/i.test(body);
}

export async function handle(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const origin = request.headers.get('Origin');
  const headers = cors(origin, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: headers['Access-Control-Allow-Origin'] ? 204 : 403, headers });
  }
  if (request.method !== 'POST') return json(405, { error: 'method' }, headers);
  if (!headers['Access-Control-Allow-Origin']) return json(403, { error: 'origin' }, headers);

  if (env.QUOTE_LIMITER) {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.QUOTE_LIMITER.limit({ key: ip });
    if (!success) return json(429, { error: 'too-many-requests' }, headers);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'too-large' }, headers);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'json' }, headers);
  }

  const result = validate(body);
  if (!result.ok) return json(400, { error: 'invalid', field: result.field }, headers);

  const sent = await sendWhatsApp(formatMessage(result.value), env, fetcher).catch(() => false);
  if (!sent) return json(502, { error: 'whatsapp' }, headers);

  return json(200, { ok: true }, headers);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env);
  },
};
