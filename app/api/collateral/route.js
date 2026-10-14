import { preflight, cachedFetch, lastGood, json, getJson } from '../../../lib/guard';
export const dynamic = 'force-dynamic';
// Where tokenized MSTR / STRATEGY is accepted as collateral. Live: Kamino (DefiLlama), Morpho (Morpho API). Teller: listed, no public per-asset data.
const RX = /^(W?MSTR(X|C|ON|B|\.D)?|BMSTR|RMSTR|STRATEGY)$/i;
const MORPHO_CHAIN = { 1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 4663: 'Robinhood Chain' };
async function kamino() {
  const [y, lb] = await Promise.all([getJson('https://yields.llama.fi/pools', { ms: 30000, maxBytes: 40_000_000 }), getJson('https://yields.llama.fi/lendBorrow', { ms: 30000, maxBytes: 40_000_000 })]);
  const L = new Map(lb.map(x => [x.pool, x]));
  return y.data.filter(p => p.project === 'kamino-lend' && RX.test(p.symbol)).map(p => { const l = L.get(p.pool) || {};
    return { protocol: 'Kamino Lend', chain: p.chain, token: p.symbol, maxLtvPct: l.ltv != null ? l.ltv * 100 : null, ltvKind: 'max', borrowAsset: 'Stablecoins & others in the market', borrowApyPct: null,
      suppliedUsd: l.totalSupplyUsd ?? p.tvlUsd, borrowedUsd: null, url: 'https://app.kamino.finance/', source: 'DefiLlama', note: l.borrowable === false ? 'Collateral only (cannot be borrowed)' : null }; });
}
async function morpho() {
  const q = '{ markets(first: 100, where:{search:"MSTR"}) { items { marketId lltv chain{id} collateralAsset{symbol address} loanAsset{symbol} state{borrowApy supplyAssetsUsd borrowAssetsUsd collateralAssetsUsd} } } }';
  const d = await getJson('https://api.morpho.org/graphql', { method: 'POST', body: JSON.stringify({ query: q }), ms: 15000 });
  return d.data.markets.items.filter(m => m.collateralAsset && RX.test(m.collateralAsset.symbol)).map(m => ({
    protocol: 'Morpho', chain: MORPHO_CHAIN[m.chain.id] || 'Chain ' + m.chain.id, token: m.collateralAsset.symbol, maxLtvPct: +m.lltv / 1e16, ltvKind: 'liquidation',
    borrowAsset: m.loanAsset.symbol, borrowApyPct: m.state.borrowApy != null ? m.state.borrowApy * 100 : null,
    suppliedUsd: m.state.collateralAssetsUsd, lendLiquidityUsd: m.state.supplyAssetsUsd, borrowedUsd: m.state.borrowAssetsUsd,
    url: 'https://app.morpho.org/', marketId: m.marketId, source: 'Morpho API' })).filter(r => (r.lendLiquidityUsd || 0) >= 1 || (r.suppliedUsd || 0) >= 1);
}
async function load() {
  const [k, m] = await Promise.allSettled([kamino(), morpho()]);
  const rows = [...(k.status === 'fulfilled' ? k.value : []), ...(m.status === 'fulfilled' ? m.value : [])];
  rows.push({ protocol: 'Teller', chain: 'Robinhood Chain', token: 'MSTR, STRATEGY', maxLtvPct: null, borrowAsset: 'Stablecoins (fixed term)', borrowApyPct: null, suppliedUsd: null, borrowedUsd: null,
    url: 'https://pro.teller.org/borrow?collateral=mstr', source: 'Teller (announced)', note: 'Per-asset LTV/APY not published via a public API' });
  if (k.status !== 'fulfilled' && m.status !== 'fulfilled') throw new Error('all_failed');
  rows.sort((a, b) => (b.suppliedUsd || 0) - (a.suppliedUsd || 0));
  return { ok: true, fetchedAt: new Date().toISOString(), rows, partial: k.status !== 'fulfilled' || m.status !== 'fulfilled' };
}
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'collateral' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try { const { value } = await cachedFetch('collateral', 600_000, load); return json(value, { origin, sMaxAge: 300 }); }
  catch (e) { const lg = lastGood('collateral'); return json(lg ? { ...lg.value, ok: false, delayed: true } : { ok: false, delayed: true, rows: [] }, { origin, sMaxAge: 30 }); }
}
