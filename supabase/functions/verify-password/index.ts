import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const encoder = new TextEncoder();

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

serve(async (req) => {
  try {
    const { password } = await req.json();
    const configuredPassword = Deno.env.get('APP_PASSWORD');

    if (!configuredPassword) {
      return new Response(JSON.stringify({ ok: false, error: 'APP_PASSWORD is not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const candidate = String(password ?? '');
    const ok = timingSafeEqual(
      encoder.encode(candidate),
      encoder.encode(configuredPassword)
    );

    return new Response(JSON.stringify({ ok }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message || 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
