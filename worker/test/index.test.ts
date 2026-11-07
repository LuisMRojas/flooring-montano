import { describe, expect, it, vi } from 'vitest';
import { Env, formatMessage, handle, validate } from '../src/index';

const ORIGIN = 'https://luismrojas.github.io';

const env = (overrides: Partial<Env> = {}): Env => ({
  CALLMEBOT_PHONE: '+13135550100',
  CALLMEBOT_APIKEY: 'test-key',
  ALLOWED_ORIGINS: `${ORIGIN},http://localhost:4200`,
  ...overrides,
});

const valid = {
  name: 'Maria Lopez',
  phone: '(313) 555-0199',
  zip: '48126',
  flooringType: 'tile',
  flooringLabel: 'Tile',
  email: 'maria@example.com',
  sqft: 300,
  preferredDate: '2026-11-20',
  preferredTime: 'morning',
  comments: 'Kitchen and bathroom',
  inServiceArea: true,
  language: 'en',
};

function post(body: unknown, origin = ORIGIN, extra: Record<string, string> = {}) {
  return new Request('https://montano-quotes.example.workers.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, ...extra },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Fake CallMeBot: records the URL it was called with. */
function fakeCallMeBot(text = 'Message queued. You will receive it in a few seconds.', status = 200) {
  const calls: string[] = [];
  const fetcher = vi.fn(async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(text, { status });
  }) as unknown as typeof fetch;
  return { fetcher, calls };
}

describe('validate', () => {
  it('accepts a full valid request', () => {
    expect(validate(valid).ok).toBe(true);
  });

  it('accepts the minimum (4 required fields + flags)', () => {
    const min = { name: 'Al', phone: '3135550199', zip: '48126', flooringType: 'not-sure', inServiceArea: false, language: 'es' };
    expect(validate(min).ok).toBe(true);
  });

  it.each([
    ['name', { name: 'A' }],
    ['phone', { phone: '555-01' }],
    ['zip', { zip: '4812' }],
    ['flooringType', { flooringType: '<script>' }],
    ['email', { email: 'not-an-email' }],
    ['sqft', { sqft: 0 }],
    ['preferredDate', { preferredDate: '20/11/2026' }],
    ['preferredTime', { preferredTime: 'midnight' }],
    ['comments', { comments: 'x'.repeat(1001) }],
    ['language', { language: 'fr' }],
  ])('rejects a bad %s', (field, patch) => {
    expect(validate({ ...valid, ...patch })).toEqual({ ok: false, field });
  });
});

describe('formatMessage', () => {
  it('lists the request in Spanish for the owner', () => {
    const text = formatMessage(validate(valid).ok ? (validate(valid) as { value: never }).value : (null as never));
    expect(text).toContain('*Nueva solicitud de estimado*');
    expect(text).toContain('Nombre: Maria Lopez');
    expect(text).toContain('Teléfono: (313) 555-0199');
    expect(text).toContain('ZIP: 48126 (dentro de la zona)');
    expect(text).toContain('Piso / servicio: Tile');
    expect(text).toContain('Pies²: 300');
    expect(text).toContain('Preferencia: 2026-11-20, mañana (8–12)');
    expect(text).toContain('Idioma del cliente: inglés');
  });

  it('flags out-of-area ZIPs and "not sure yet"', () => {
    const r = validate({ ...valid, zip: '49503', inServiceArea: false, flooringType: 'not-sure' });
    const text = formatMessage((r as { value: never }).value);
    expect(text).toContain('FUERA de la zona');
    expect(text).toContain('Aún no sabe');
  });
});

describe('handle', () => {
  it('sends the WhatsApp and answers ok with CORS for the site', async () => {
    const { fetcher, calls } = fakeCallMeBot();
    const res = await handle(post(valid), env(), fetcher);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    const url = new URL(calls[0]);
    expect(url.origin + url.pathname).toBe('https://api.callmebot.com/whatsapp.php');
    expect(url.searchParams.get('phone')).toBe('+13135550100');
    expect(url.searchParams.get('apikey')).toBe('test-key');
    expect(url.searchParams.get('text')).toContain('Maria Lopez');
  });

  it('answers the CORS preflight only for allowed origins', async () => {
    const ok = await handle(new Request('https://w/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env());
    expect(ok.status).toBe(204);
    const bad = await handle(new Request('https://w/', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }), env());
    expect(bad.status).toBe(403);
  });

  it('refuses posts from other sites without calling WhatsApp', async () => {
    const { fetcher, calls } = fakeCallMeBot();
    const res = await handle(post(valid, 'https://evil.example'), env(), fetcher);
    expect(res.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it('rejects invalid data with the field name', async () => {
    const { fetcher, calls } = fakeCallMeBot();
    const res = await handle(post({ ...valid, zip: 'abc' }), env(), fetcher);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid', field: 'zip' });
    expect(calls).toHaveLength(0);
  });

  it('rejects broken JSON and oversized bodies', async () => {
    expect((await handle(post('{nope'), env())).status).toBe(400);
    expect((await handle(post('x'.repeat(10_001)), env())).status).toBe(413);
  });

  it('only accepts POST', async () => {
    const res = await handle(new Request('https://w/', { method: 'GET', headers: { Origin: ORIGIN } }), env());
    expect(res.status).toBe(405);
  });

  it('applies the per-visitor rate limit', async () => {
    const { fetcher, calls } = fakeCallMeBot();
    const limiter = { limit: vi.fn(async () => ({ success: false })) };
    const res = await handle(post(valid, ORIGIN, { 'CF-Connecting-IP': '1.2.3.4' }), env({ QUOTE_LIMITER: limiter }), fetcher);
    expect(res.status).toBe(429);
    expect(limiter.limit).toHaveBeenCalledWith({ key: '1.2.3.4' });
    expect(calls).toHaveLength(0);
  });

  it('reports a failure when CallMeBot rejects the key', async () => {
    const { fetcher } = fakeCallMeBot('APIKey is invalid. Please check it.');
    const res = await handle(post(valid), env(), fetcher);
    expect(res.status).toBe(502);
  });

  it('reports a failure when CallMeBot is unreachable', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('network');
    }) as unknown as typeof fetch;
    expect((await handle(post(valid), env(), fetcher)).status).toBe(502);
  });
});
