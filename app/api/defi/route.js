import { preflight, cachedFetch, lastGood, json, getJson } from '../../../lib/guard';
export const dynamic = 'force-dynamic';
const RX = /(^|-|W)MSTR(X|C|ON|B)?($|-)/i;
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'defi' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try {
    const { value } = await cachedFetch('defi', 600_000, async () => {
      const [y, t] = await Promise.allSettled([getJson('https://yields.llama.fi/pools', { ms: 30000, maxBytes: 40_000_000 }), getJson('https://api.llama.fi/protocol/teller', { ms: 20000 })]);
      if (y.status !== 'fulfilled') throw new Error('yields');
      const pools = y.value.data.filter(p => RX.test(p.symbol)).map(p => ({ chain: p.chain, project: p.project, symbol: p.symbol, tvlUsd: Math.round(p.tvlUsd), apy: p.apy == null ? null : +p.apy.toFixed(2), pool: p.pool })).sort((a, b) => b.tvlUsd - a.tvlUsd);
      const byChain = {}; pools.forEach(p => byChain[p.chain] = (byChain[p.chain] || 0) + p.tvlUsd);
      let tellerTvl = null; if (t.status === 'fulfilled') tellerTvl = Object.entries(t.value.currentChainTvls || {}).filter(([k]) => !/-|borrowed|staking|pool2/.test(k)).reduce((a, [, v]) => a + v, 0);
      return { ok: true, source: 'defillama', fetchedAt: new Date().toISOString(), pools, byChain, totalTvlUsd: pools.reduce((a, p) => a + p.tvlUsd, 0), kamino: pools.find(p => p.project === 'kamino-lend') || null, teller: { protocolTvlUsd: tellerTvl, mstrOnly: null } };
    });
    return json(value, { origin, sMaxAge: 300 });
  } catch (e) { console.error('defi', e && e.message); const lg = lastGood('defi'); return json(lg ? { ...lg.value, ok: false, delayed: true } : { ok: false, delayed: true, pools: [] }, { origin, sMaxAge: 15 }); }
}
