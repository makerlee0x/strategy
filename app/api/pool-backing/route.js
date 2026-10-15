import { preflight, cachedFetch, lastGood, json, getJson } from '../../../lib/guard';
export const dynamic = 'force-dynamic';
// Launch positions read from Uniswap v4 ModifyLiquidity logs (immutable, single-sided, token-only).
// stockInPool = L × (√p − √p_launch), p = stock per coin (both 18 decimals). See research/POOL-BACKING-MODEL.md.
const T = t => Math.pow(1.0001, t);
const COINS = [
  { key: 'STRATEGY', stock: 'MSTR', pair: '0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0', tokenIs0: true, lo: -157672, hi: -47232, L: 375129.362198234609, L2: 848523.625770020674 },
  { key: 'AI', stock: 'NVDA', pair: '0xcbdfea90430a30ee4469c9902e120a77e7c7e4711d5643671c1d1957f2f1ce27', tokenIs0: true, lo: -161728, hi: -51296, L: 306274.781544203373 },
  { key: 'BONER', stock: 'HIMS', pair: '0x9c89b04303dfa76f3f6fb02c2b77be0e8a00ab8fa00d507119acd54ab3e8640d', tokenIs0: true, lo: -142408, hi: -31976, L: 804671.710448648329 },
  { key: 'MEME', stock: 'AMC', pair: '0x27ccf0a6d1ee74840220715bcca7d3b01e0d33aa30d0259b47ae1585b3f4c071', tokenIs0: false, lo: 7016, hi: 117448, L: 2802793.802444906584 },
];
const SUPPLY = 1e9;
async function one(c) {
  const d = await getJson('https://api.dexscreener.com/latest/dex/pairs/robinhood/' + c.pair);
  const p = d.pairs?.[0]; if (!p) throw new Error('no pair');
  const coinIsBase = p.baseToken.symbol !== c.stock;
  const stockInPool = Number(coinIsBase ? p.liquidity?.quote : p.liquidity?.base), coinInPool = Number(coinIsBase ? p.liquidity?.base : p.liquidity?.quote);
  const priceUsd = Number(p.priceUsd), priceNative = Number(p.priceNative);
  const pStock = coinIsBase ? priceNative : 1 / priceNative; // stock per coin
  const stockUsd = coinIsBase ? priceUsd / priceNative : priceUsd; // DexScreener priceUsd is base's USD price
  const coinUsd = pStock * stockUsd, mcapUsd = coinUsd * SUPPLY;
  // launch price (stock per coin) and range top
  const pLaunch = c.tokenIs0 ? T(c.lo) : 1 / T(c.hi), pTop = c.tokenIs0 ? T(c.hi) : 1 / T(c.lo);
  const curve = c.L * (Math.sqrt(pStock) - Math.sqrt(pLaunch));
  return { key: c.key, stock: c.stock, pair: c.pair, url: 'https://dexscreener.com/robinhood/' + c.pair, L: c.L, L2: c.L2 || null, pLaunch, pTop,
    launchMcapStock: pLaunch * SUPPLY, rangeTopMcapStock: pTop * SUPPLY, stockUsd, coinUsd, mcapUsd, pStock,
    stockInPool, coinInPool, curveStock: curve, f: curve > 0 ? stockInPool / curve : null, backingPct: mcapUsd ? stockInPool * stockUsd / mcapUsd * 100 : null };
}
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'poolbacking' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try {
    const { value, cache } = await cachedFetch('poolbacking', 90_000, async () => {
      const rs = await Promise.allSettled(COINS.map(one));
      const coins = rs.map((r, i) => r.status === 'fulfilled' ? r.value : { key: COINS[i].key, stock: COINS[i].stock, error: true });
      if (coins[0].error) throw new Error('strategy pair unavailable');
      return { ok: true, source: 'dexscreener + onchain launch ranges', supply: SUPPLY, fetchedAt: new Date().toISOString(), strategy: coins[0], others: coins.slice(1) };
    });
    return json(value, { origin, sMaxAge: 60, swr: 300, headers: { 'X-Cache': cache } });
  } catch (_) {
    const lg = lastGood('poolbacking');
    if (lg) return json({ ...lg.value, delayed: true }, { origin, sMaxAge: 15, headers: { 'X-Cache': 'STALE' } });
    return json({ ok: false, delayed: true }, { origin, sMaxAge: 15, headers: { 'X-Cache': 'DELAYED' } });
  }
}
