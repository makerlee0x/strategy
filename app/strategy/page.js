'use client';
// STRATEGY stats: every number behind the coin. The landing page (/) links here.
import { fmt, num, St } from '../data'; import { Panel, Barcode } from '../ui'; import Actions from './Modals'; import Chart from './Chart'; import { useLive } from '../../lib/useLive'; import PoolBacking from './PoolBacking'; import Metrics from './Metrics';
const CA = '0x168661c52e5922288dfb2b3f323b6cf90eb21e18';
const L = [['Explorer', 'https://robinhoodchain.blockscout.com/token/' + CA], ['Long', 'https://app.long.xyz/tokens/' + CA], ['FOMO', 'https://fomo.family/coin?address=' + CA + '&chainId=4663&r=0xmakerlee&source=share_link'], ['Dexscreener', 'https://dexscreener.com/robinhood/0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0'], ['@strategystock', 'https://x.com/strategystock'], ['Learn more', 'https://robinhood.com/rhj/stocktokens/']];
export default function P() {
  const [SM, PO, XF, RH] = useLive(['/api/strategy-metrics', '/api/pools', '/api/x-feed', '/api/robinhood-mstr']); const F8 = useLive('/api/strategy-filings'); const PB = useLive('/api/pool-backing'); const H = useLive('/api/strategy-history');
  const M = SM?.display || {}, R = SM?.raw || {}, pools = PO?.pools || [], prim = pools.find(p => p.primary);
  const fees = R.volume24h != null ? R.volume24h / 1e6 * 1000 : null;
  const box = (k, v, red) => <div><div className="k">{k}</div><div className="stamp" style={{ fontSize: 30, color: red ? 'var(--red-t)' : 'var(--ink)' }}>{v ?? '—'}</div></div>;
  return (<><div className="eyebrow">File 000 · The coin · {SM?.fetchedAt ? 'Updated ' + new Date(SM.fetchedAt).toLocaleTimeString() : 'Loading'} · <St d={SM} /></div>
    <h1 className="d">$STRATEGY <em>stats.</em></h1><p className="sub" style={{ fontSize: 15 }}>Every number behind the coin: what the pool holds, how it grows, and where it trades.</p>
    <Actions links={L} asOf={PO?.fetchedAt?.slice(0, 10) || ''} pools={pools.slice(0, 10).map(p => ({ id: p.id, name: p.pair, dex: p.dex, liq: fmt(p.liquidityUsd), vol: fmt(p.volume24hUsd) }))} />
    <Metrics PB={PB} H={H} F8={F8} />
    <div className="g3">
      <Panel t="Value" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('Price in MSTR', M.priceMstr)}{box('Market cap', M.marketCap, 1)}{box('Supply', M.strategySupply)}{box('Fully diluted', M.fdv)}</div></Panel>
      <Panel t="Liquidity" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('Pool size', M.liquidityUsd, 1)}{box('MSTR in pool', M.mstrInLp)}{box('Robinhood MSTR', RH?.supply ? num(RH.supply) : M.mstrTokenized)}{box('% of it in pool', R.mstrInLp != null && RH?.supply ? (R.mstrInLp / RH.supply * 100).toFixed(2) + '%' : M.mstrInLpPct, 1)}</div></Panel>
      <Panel t="Market" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('24h volume', M.volume24h, 1)}{box('Holders', M.holders)}{box('24h trades', M.trades24h)}{box('Pair', M.pairAsset)}</div></Panel></div>
    <Chart />
    <PoolBacking D={PB} F8={F8} />
    <div className="redblock"><div className="big d" style={{ fontSize: 36 }}>Buy STRATEGY,<br />pool holds MSTR.</div><div className="rows">
      <div><i>01</i><span>The pool pairs STRATEGY with real tokenized MSTR. Buying STRATEGY adds MSTR to the pool.</span></div>
      <div><i>02</i><span>Robinhood MSTR is minted by market makers against real shares; more demand → more minting.</span></div>
      <div><i>03</i><span>The main STRATEGY/MSTR pool holds {prim ? fmt(prim.liquidityUsd) : '—'} of liquidity across {pools.length || '—'} STRATEGY pools.</span></div>
      <div style={{ border: 0 }}><Barcode seed="STRATMSTR" w={260} h={26} c="#ffffff" /></div></div></div>
    <div className="g3">
      <Panel t="Borrow against it"><div className="d" style={{ fontSize: 22 }}>Teller collateral</div><p className="sub">STRATEGY and Robinhood MSTR can back fixed-term stablecoin loans on Teller, no margin calls during the term.</p><a href="https://x.com/useteller/status/2101343754179547518" style={{ color: 'var(--red-t)' }}>@useteller announcement ↗</a></Panel>
      <Panel t="Creator fees"><div className="stamp">{fees != null ? '~$' + num(fees) : '—'}</div><div className="k">est. per day at current volume</div><p className="sub">≈ $1,000 per $1M traded.</p></Panel>
      <Panel t="The pair" r={<St d={PO} s="GECKOTERMINAL" />}><div className="stamp">{prim ? fmt(prim.volume24hUsd) : '—'}</div><div className="k">STRATEGY / MSTR · 24h</div><p className="sub">Main pool on Robinhood Chain (Uniswap v4 via Bankr).</p></Panel></div>
    <Panel t="News · @strategystock" r={<St d={XF} s="X" />}>{XF?.posts?.length ? <div className="news">{XF.posts.map((p, i) => <a key={p.id} className="newsrow" href={p.url} target="_blank" rel="noopener"><span className="stamp" style={{ fontSize: 22, margin: 0 }}>{String(i + 1).padStart(2, '0')}</span><span style={{ flex: 1 }}>{p.text}</span><span className="k">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</span></a>)}</div> : <div className="k">{XF ? 'Feed unavailable right now. ' : 'Loading… '}<a href="https://x.com/strategystock">Open @strategystock on X ↗</a></div>}</Panel></>);
}
