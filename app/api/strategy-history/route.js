import { preflight, cachedFetch, lastGood, json } from '../../../lib/guard';
import { kv, kvConfigured } from '../../../lib/kv';
import { sampleHistory } from '../../../lib/metrics.mjs';
export const dynamic = 'force-dynamic';
// Daily STRATEGY records from KV. Until KV is connected and has at least 2 days, returns placeholder history with sample: true.
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'history' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try {
    const { value } = await cachedFetch('strategy-history', 600_000, async () => {
      let days = [];
      if (kvConfigured()) { const flat = await kv(['HGETALL', 'strategy:daily']) || []; for (let i = 0; i < flat.length; i += 2) days.push(JSON.parse(flat[i + 1])); days.sort((a, b) => a.d < b.d ? -1 : 1); }
      const sample = days.length < 2;
      return { ok: true, sample, source: sample ? 'placeholder' : 'kv', fetchedAt: new Date().toISOString(), days: sample ? sampleHistory() : days };
    });
    return json(value, { origin, sMaxAge: 300 });
  } catch (e) { console.error('history', e && e.message); const lg = lastGood('strategy-history'); return json(lg ? { ...lg.value, ok: false, delayed: true } : { ok: false, delayed: true, days: [] }, { origin, sMaxAge: 15 }); }
}
