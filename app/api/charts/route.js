import { preflight, cachedFetch, json, getJson } from '../../../lib/guard';
export const dynamic = 'force-dynamic';
const STS = 'https://stocktokenswap.com', STRATEGY = '0x168661c52e5922288dfb2b3f323b6cf90eb21e18', PRIMARY = '0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0';
const isAddr = v => /^0x[a-fA-F0-9]{40}$/.test(v || ''), isPool = v => /^0x[a-fA-F0-9]{40,66}$/.test(v || '');
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'charts' }); if (pf) return pf;
  const origin = req.headers.get('origin') || ''; const q = new URL(req.url).searchParams;
  const token = isAddr(q.get('token')) ? q.get('token').toLowerCase() : STRATEGY, pairId = isPool(q.get('pairId')) ? q.get('pairId').toLowerCase() : PRIMARY;
  const resolution = ['15', '60', '240'].includes(q.get('resolution')) ? q.get('resolution') : '60';
  const rangeDays = [1, 7, 30].includes(Number(q.get('rangeDays'))) ? Number(q.get('rangeDays')) : 7;
  try {
    const { value, cache } = await cachedFetch(`charts:${token}:${pairId}:${resolution}:${rangeDays}`, 60_000, async () => {
      const qs = new URLSearchParams({ resolution, rangeDays: String(rangeDays), pairId });
      const d = await getJson(`${STS}/api/charts/${token}?${qs}`, { headers: { Origin: 'https://www.strategycoin.io' } });
      const s = d.series && typeof d.series === 'object' ? d.series : d;
      const candles = (Array.isArray(s.candles) ? s.candles : []).slice(-500).map(c => ({ time: +c.time, open: +c.open, high: +c.high, low: +c.low, close: +c.close, volume: +c.volume || 0 })).filter(c => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite));
      return { ok: true, candles, source: String(s.source || 'coingecko').slice(0, 32), resolution, rangeDays, symbol: String(s.symbol || 'STRATEGY').slice(0, 64), observedAt: String(s.observedAt || '').slice(0, 40), pairId };
    });
    return json(value, { origin, swr: 120, headers: { 'X-Cache': cache } });
  } catch (_) { return json({ ok: false, error: 'chart_unavailable', delayed: true, candles: [] }, { status: 502, origin, sMaxAge: 15 }); }
}
