import { preflight, cachedFetch, lastGood, json, getJson } from '../../../lib/guard';
import cg from '../../../data/coingecko-tokens.json';
export const dynamic = 'force-dynamic';
// Per-chain activity for tokenized MSTR: 24h DEX volume + DEX liquidity (GeckoTerminal token totals) and DeFi TVL (DefiLlama, incl. lending).
const NET = { robinhood: ['robinhood', 'Robinhood Chain'], solana: ['solana', 'Solana'], base: ['base', 'Base'], 'arbitrum-one': ['arbitrum', 'Arbitrum'], ethereum: ['eth', 'Ethereum'], 'binance-smart-chain': ['bsc', 'BNB Chain'], avalanche: ['avax', 'Avalanche'], hyperevm: ['hyperevm', 'HyperEVM'], 'morph-l2': ['morph-l2', 'Morph'], mantle: ['mantle', 'Mantle'] };
// Tokens not in the CoinGecko list: Mantle WMSTRX (DefiLlama fluxion pool underlying).
const EXTRA = { mantle: ['0x266e5923f6118f8b340ca5a23ae7f71897361476'] };
// Chains seen only in DefiLlama (no GeckoTerminal network).
const LLAMA_ONLY = ['Defichain'];
const RX = /(^|-|W)MSTR(X|C|ON|B)?($|-)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function load() {
  const by = {};
  for (const t of cg.tokens) for (const [p, a] of Object.entries(t.platforms || {})) if (NET[p]) (by[p] ||= []).push(a);
  for (const [p, a] of Object.entries(EXTRA)) (by[p] ||= []).push(...a);
  const chains = [];
  for (const [p, addrs] of Object.entries(by)) {
    const [gt, label] = NET[p];
    try {
      const url = `https://api.geckoterminal.com/api/v2/networks/${gt}/tokens/multi/${[...new Set(addrs)].join(',')}`; let d;
      for (let i = 0; ; i++) { try { d = await getJson(url, { ms: 15000 }); break; } catch (e) { if (i >= 3) throw e; await sleep(2500 * (i + 1)); } }
      const vol = d.data.reduce((s, x) => s + (+x.attributes.volume_usd?.h24 || 0), 0), liq = d.data.reduce((s, x) => s + (+x.attributes.total_reserve_in_usd || 0), 0);
      const top = d.data.flatMap(x => x.relationships?.top_pools?.data || []).map(x => x.id)[0] || null;
      chains.push({ key: p, chain: label, vol24Usd: vol, dexLiquidityUsd: liq, topPool: top, tokens: d.data.map(x => x.attributes.symbol) });
    } catch (_) { chains.push({ key: p, chain: label, error: true }); }
    await sleep(1200);
  }
  // Concentration check on chains with >$1M daily volume: share of the last 300 trades in the top pool made by the single busiest address.
  for (const c of chains) if (!c.error && c.vol24Usd > 1e6 && c.topPool) {
    try {
      const [net, addr] = [c.topPool.split('_')[0], c.topPool.split('_').slice(1).join('_')];
      const t = (await getJson(`https://api.geckoterminal.com/api/v2/networks/${net}/pools/${addr}/trades`, { ms: 15000 })).data.map(x => x.attributes);
      const by = {}; let tot = 0; for (const x of t) { const v = +x.volume_in_usd || 0; tot += v; by[x.tx_from_address] = (by[x.tx_from_address] || 0) + v; }
      const top = Object.values(by).sort((a, b) => b - a);
      c.sample = { trades: t.length, traders: Object.keys(by).length, topTraderPct: tot ? top[0] / tot * 100 : null, top3Pct: tot ? (top[0] + (top[1] || 0) + (top[2] || 0)) / tot * 100 : null, avgTradeUsd: t.length ? tot / t.length : null, from: t[t.length - 1]?.block_timestamp, to: t[0]?.block_timestamp };
    } catch (_) {}
    await sleep(1200);
  }
  let llama = null;
  try {
    const y = await getJson('https://yields.llama.fi/pools', { ms: 30000, maxBytes: 40_000_000 }); llama = {};
    y.data.filter(p => RX.test(p.symbol)).forEach(p => llama[p.chain] = (llama[p.chain] || 0) + p.tvlUsd);
  } catch (_) {}
  for (const c of chains) c.defiTvlUsd = llama ? (llama[c.chain] ?? null) : null;
  for (const n of LLAMA_ONLY) chains.push({ key: n.toLowerCase(), chain: n, vol24Usd: null, dexLiquidityUsd: null, defiTvlUsd: llama ? (llama[n] ?? null) : null, noDexData: true });
  for (const c of chains) { c.turnover = c.vol24Usd != null && c.dexLiquidityUsd ? c.vol24Usd / c.dexLiquidityUsd : null; c.botFlag = !!(c.sample && c.sample.topTraderPct >= 40); }
  if (chains.every(c => c.error)) throw new Error('all_failed');
  chains.sort((a, b) => (b.vol24Usd ?? -1) - (a.vol24Usd ?? -1));
  chains.forEach((c, i) => c.rank = c.vol24Usd != null ? i + 1 : null);
  const totVol = chains.reduce((s, c) => s + (c.vol24Usd || 0), 0);
  chains.forEach(c => c.volSharePct = totVol && c.vol24Usd != null ? c.vol24Usd / totVol * 100 : null);
  return { ok: true, fetchedAt: new Date().toISOString(), source: 'geckoterminal + defillama', totalDexVol24Usd: totVol, llamaTracked: llama ? Object.keys(llama) : [], chains,
    note: 'Volume and DEX liquidity: GeckoTerminal 24h totals for each tokenized-MSTR contract on that chain. DeFi TVL: DefiLlama pools with MSTR tokens (DEX + lending); DefiLlama does not list Robinhood Chain.' };
}
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 30 }, anon: { limit: 10 }, prefix: 'chains' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try { const { value } = await cachedFetch('chains', 600_000, load); return json(value, { origin, sMaxAge: 300 }); }
  catch (e) { const lg = lastGood('chains'); return json(lg ? { ...lg.value, ok: false, delayed: true } : { ok: false, delayed: true, chains: [] }, { origin, sMaxAge: 30 }); }
}
