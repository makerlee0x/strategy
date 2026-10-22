'use client';
import { fmt, num, St } from '../data'; import { Panel, Barcode } from '../ui'; import Actions from './Modals'; import Chart from './Chart'; import { useLive } from '../../lib/useLive'; import { Backing } from '../backing'; import PoolBacking from './PoolBacking'; import Metrics from './Metrics'; import { summarize } from '../../lib/metrics.mjs';
const CA = '0x168661c52e5922288dfb2b3f323b6cf90eb21e18';
const L = [['Explorer', 'https://robinhoodchain.blockscout.com/token/' + CA], ['Long', 'https://app.long.xyz/tokens/' + CA], ['FOMO', 'https://fomo.family/coin?address=' + CA + '&chainId=4663&r=0xmakerlee&source=share_link'], ['Dexscreener', 'https://dexscreener.com/robinhood/0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0'], ['@strategystock', 'https://x.com/strategystock'], ['Learn more', 'https://robinhood.com/rhj/stocktokens/']];
const pc = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
export default function P() {
  const [SM, PO, XF, RH, T] = useLive(['/api/strategy-metrics', '/api/pools', '/api/x-feed', '/api/robinhood-mstr', '/api/mstr-tokens']); const F8 = useLive('/api/strategy-filings'); const PB = useLive('/api/pool-backing'); const H = useLive('/api/strategy-history');
  const M = SM?.display || {}, R = SM?.raw || {}, pools = PO?.pools || [], prim = pools.find(p => p.primary);
  const fees = R.volume24h != null ? R.volume24h / 1e6 * 1000 : null;
  const S = PB?.strategy && !PB.strategy.error ? PB.strategy : null, per1M = S ? S.stockInPool / 1e3 : null, sats = per1M != null && F8?.satsPerShare ? per1M * F8.satsPerShare : null;
  const Y = H?.days?.length ? summarize(H.days) : null, sample = H?.sample, y30 = Y ? pc(Y.yield30d) + (sample ? ' (SAMPLE)' : '') : '—';
  const tick = [`$STRATEGY ${M.priceUsd || '—'}`, `1M STRATEGY = ${per1M != null ? per1M.toFixed(2) : '—'} MSTR`, `MSTR YIELD 30D ${y30}`, `${M.holders || '—'} HOLDERS`, `POOL HOLDS ${S ? num(S.stockInPool) : '—'} MSTR`, `${sats != null ? num(sats) : '—'} SATS PER 1M`].join(' ✦ ') + ' ✦';
  const post = `1M $STRATEGY = ${per1M != null ? per1M.toFixed(2) : '—'} MSTR = ${sats != null ? num(sats) : '—'} sats of Saylor's bitcoin. Amplified MSTR. strategycoin.io`;
  const box = (k, v, red) => <div><div className="k">{k}</div><div className="stamp" style={{ fontSize: 30, color: red ? 'var(--red-t)' : 'var(--ink)' }}>{v ?? '—'}</div></div>;
  const tile = (h, t, s, hot) => <a href={h} style={{ textDecoration: 'none', padding: 22, background: hot ? 'var(--red)' : 'var(--panel)', color: hot ? 'var(--on-red)' : 'var(--ink)', boxShadow: hot ? '5px 5px 0 var(--ink)' : '5px 5px 0 var(--red)' }}><div className="d" style={{ fontSize: 22 }}>{t}</div><div style={{ fontSize: 12, marginTop: 6 }}>{s}</div></a>;
  return (<>
    <section className="hero-red"><div className="in">
      <p className="steps">step 1: hold MSTR<br />step 2: keep holding MSTR<br />step 3: hold the thing that holds MSTR</p>
      <h1>HOLD.<br />HOLD.<br /><span>AMPLIFY.</span></h1>
      <p className="lede">STRATEGY is a memecoin paired with real tokenized MSTR on Robinhood Chain. MSTR is amplified bitcoin. STRATEGY is amplified MSTR.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}><a className="pillbtn" href="#buy" style={{ background: '#ffffff', color: '#b51d27' }}>BUY $STRATEGY</a><a className="pillbtn" href="#ways" style={{ background: 'var(--bg)', color: '#ffffff' }}>STAKE · SOON</a></div>
      <div className="sticker" aria-label="MSTR per 1M STRATEGY"><b>{per1M != null ? per1M.toFixed(2) : '—'}</b><span>MSTR PER 1M COINS</span></div>
    </div></section>
    <div className="ticker" aria-label="STRATEGY at a glance"><div><span>{tick}</span><span aria-hidden="true">{tick}</span></div></div>

    <section id="stack"><h2 className="sec-h">The stack</h2><p className="sub" style={{ margin: '0 0 28px' }}>If MSTR is amplified BTC, STRATEGY is amplified MSTR. Three layers, one trade.</p>
      <div className="g3">
        <div className="layer" style={{ background: 'var(--panel)' }}><div className="k">Layer 01</div><div className="d">$BTC</div><div className="say" style={{ fontSize: 13 }}>Strategy holds {F8?.latest ? num(F8.latest.btcHeld) : '—'} BTC. Hardest money on earth.</div></div>
        <div className="layer" style={{ background: 'var(--ink)', color: 'var(--bg)' }}><div className="k" style={{ color: 'var(--bg)' }}>Layer 02</div><div className="d">$MSTR</div><div className="say" style={{ fontSize: 13 }}>Each share = {F8?.satsPerShare ? num(F8.satsPerShare) : '—'} sats. Amplified bitcoin, now a token, trading 24/7.</div></div>
        <div className="layer" style={{ background: 'var(--red)', color: 'var(--on-red)', boxShadow: '6px 6px 0 var(--ink)' }}><div className="k" style={{ color: 'var(--on-red)' }}>Layer 03</div><div className="d">$STRATEGY</div><div className="say" style={{ fontSize: 13 }}>Every 1M coins = {per1M != null ? per1M.toFixed(2) : '—'} MSTR in the pool. Amplified MSTR. You are here.</div></div>
      </div></section>

    <section id="ways" style={{ scrollMarginTop: 16 }}><h2 className="sec-h">Two ways to win</h2>
      <div className="g2" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 28 }}>
        <div style={{ background: 'var(--panel)', padding: 28 }}><div className="d" style={{ fontSize: 26 }}>01 · Hold</div><div className="k" style={{ margin: '6px 0 18px' }}>like MSTR · accretion</div><div className="big red" style={{ fontSize: 64 }}>{Y ? pc(Y.yield30d) : '—'}</div>{sample && <span className="tag sample" title="Placeholder history until daily snapshots are connected">SAMPLE</span>}<div className="say" style={{ fontSize: 13 }}>MSTR Yield, 30 days. Trading fees add MSTR to the pool, so each coin holds more MSTR. Price pumps don’t count. Fees do.</div></div>
        <div style={{ border: '2px dashed var(--red-t)', padding: 28 }}><div className="d" style={{ fontSize: 26, color: 'var(--red-t)' }}>02 · Stake</div><div className="k" style={{ margin: '6px 0 18px' }}>like STRC · yield</div><div className="big" style={{ fontSize: 64 }}>SOON</div><div className="say" style={{ fontSize: 13 }}>Stake STRATEGY on Carry and keep more of the fees your MSTR earns. Built by the Strategy Coin team. Levels and launch date will be announced on @strategystock.</div><a href="https://usecarry.io/?ref=strategycoin" target="_blank" rel="noopener" style={{ color: 'var(--red-t)', display: 'inline-block', marginTop: 12 }}>usecarry.io ↗</a></div>
      </div></section>

    <section><h2 className="sec-h">Flex your stack</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', marginTop: 24 }}>
        <div style={{ flex: '999 1 460px', minWidth: 0 }}><div className="eyebrow">The coin · {SM?.fetchedAt ? 'Updated ' + new Date(SM.fetchedAt).toLocaleTimeString() : 'Loading'} · <St d={SM} /></div>
          <Actions links={L} asOf={PO?.fetchedAt?.slice(0, 10) || ''} pools={pools.slice(0, 10).map(p => ({ id: p.id, name: p.pair, dex: p.dex, liq: fmt(p.liquidityUsd), vol: fmt(p.volume24hUsd) }))} /></div>
        <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', justifyContent: 'center' }}><div className="tilt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700 }}><span className="d" style={{ fontSize: 18, color: 'var(--red)' }}>$S</span><span>SHARE CARD</span></div>
          <div className="d" style={{ fontSize: 34, margin: '18px 0 6px' }}>1M = {per1M != null ? per1M.toFixed(2) : '—'} MSTR</div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>every 1M STRATEGY sits on {per1M != null ? per1M.toFixed(2) : '—'} MSTR in the pool = {sats != null ? num(sats) : '—'} sats of Saylor’s bitcoin.</div>
          <a className="btn" href={'https://x.com/intent/post?text=' + encodeURIComponent(post)} target="_blank" rel="noopener" style={{ display: 'block', textAlign: 'center', background: 'var(--bg)', color: 'var(--ink)', marginTop: 16 }}>post to x</a>
        </div></div></div>
      <Metrics PB={PB} H={H} F8={F8} /></section>

    <section><h2 className="sec-h">Got MSTR? Put it to work.</h2><p className="sub" style={{ margin: '0 0 28px' }}>The one-stop shop for stock token holders. Every MSTR token, every chain, every way to earn.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>{tile('/earn/#fees', 'Earn fees', 'LP pools · Carry soon')}{tile('/earn/#lend', 'Lend', 'Kamino · Morpho')}{tile('/earn/#borrow', 'Borrow', 'Teller · Morpho')}{tile('/earn/#hedge', 'Trade 24/7', 'perps · nights + weekends', 1)}</div></section>

    <section><h2 className="sec-h">Under the hood</h2>
    <div className="g3">
      <Panel t="Value" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('Price in MSTR', M.priceMstr)}{box('Market cap', M.marketCap, 1)}{box('Supply', M.strategySupply)}{box('Fully diluted', M.fdv)}</div></Panel>
      <Panel t="Liquidity" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('Pool size', M.liquidityUsd, 1)}{box('MSTR in pool', M.mstrInLp)}{box('Robinhood MSTR', RH?.supply ? num(RH.supply) : M.mstrTokenized)}{box('% of it in pool', R.mstrInLp != null && RH?.supply ? (R.mstrInLp / RH.supply * 100).toFixed(2) + '%' : M.mstrInLpPct, 1)}</div></Panel>
      <Panel t="Market" r={<St d={SM} s="STS" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>{box('24h volume', M.volume24h, 1)}{box('Holders', M.holders)}{box('24h trades', M.trades24h)}{box('Pair', M.pairAsset)}</div></Panel></div>
    <Backing F8={F8} SM={SM} coin={false} />
    <PoolBacking D={PB} F8={F8} />
    <Chart />
    <div className="redblock"><div className="big d" style={{ fontSize: 36 }}>Buy STRATEGY,<br />pool holds MSTR.</div><div className="rows">
      <div><i>01</i><span>The pool pairs STRATEGY with real tokenized MSTR. Buying STRATEGY adds MSTR to the pool.</span></div>
      <div><i>02</i><span>Robinhood MSTR is minted by market makers against real shares; more demand → more minting.</span></div>
      <div><i>03</i><span>The main STRATEGY/MSTR pool holds {prim ? fmt(prim.liquidityUsd) : '—'} of liquidity across {pools.length || '—'} STRATEGY pools.</span></div>
      <div style={{ border: 0 }}><Barcode seed="STRATMSTR" w={260} h={26} c="#ffffff" /></div></div></div>
    <div className="g3">
      <Panel t="Borrow against it"><div className="d" style={{ fontSize: 22 }}>Teller collateral</div><p className="sub">STRATEGY and Robinhood MSTR can back fixed-term stablecoin loans on Teller, no margin calls during the term.</p><a href="https://x.com/useteller/status/2101343754179547518" style={{ color: 'var(--red-t)' }}>@useteller announcement ↗</a></Panel>
      <Panel t="Creator fees"><div className="stamp">{fees != null ? '~$' + num(fees) : '—'}</div><div className="k">est. per day at current volume</div><p className="sub">≈ $1,000 per $1M traded.</p></Panel>
      <Panel t="The pair" r={<St d={PO} s="GECKOTERMINAL" />}><div className="stamp">{prim ? fmt(prim.volume24hUsd) : '—'}</div><div className="k">STRATEGY / MSTR · 24h</div><p className="sub">Main pool on Robinhood Chain (Uniswap v4 via Bankr).</p></Panel></div>
    <Panel t="News · @strategystock" r={<St d={XF} s="X" />}>{XF?.posts?.length ? <div className="news">{XF.posts.map((p, i) => <a key={p.id} className="newsrow" href={p.url} target="_blank" rel="noopener"><span className="stamp" style={{ fontSize: 22, margin: 0 }}>{String(i + 1).padStart(2, '0')}</span><span style={{ flex: 1 }}>{p.text}</span><span className="k">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</span></a>)}</div> : <div className="k">{XF ? 'Feed unavailable right now. ' : 'Loading… '}<a href="https://x.com/strategystock">Open @strategystock on X ↗</a></div>}</Panel></section>

    <section style={{ background: 'var(--red)', color: 'var(--on-red)', padding: 36, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', margin: '56px 0 0', boxShadow: '8px 8px 0 var(--ink)' }}>
      <div style={{ flex: '999 1 420px' }}><div className="d" style={{ fontSize: 34, lineHeight: 1.05 }}>{T?.totals?.circ ? num(T.totals.circ) : '—'} MSTR tokens on-chain.</div><div style={{ fontSize: 13, marginTop: 8 }}>{fmt(T?.totals?.mcap)} across {T?.tokens?.length || '—'} issuers. Every token, every chain.</div></div>
      <a className="btn" href="/mstr/" style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: '5px 5px 0 var(--bg)', marginTop: 0 }}>open MSTR on-chain</a></section>
  </>);
}
