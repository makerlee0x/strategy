'use client';
// Landing page: the hybrid mockup (B1 red poster hero, A3 oxblood body). Detailed coin data lives on /strategy.
import { fmt, num } from './data'; import { useLive } from '../lib/useLive'; import { summarize } from '../lib/metrics.mjs'; import Actions, { CopyAddr, ADDR } from './strategy/Modals'; import ShareOfSupply from './supply'; import { EightKBanner } from './eightk'; import { eightK, isFresh } from '../lib/eightk.mjs'; import { useEffect, useState } from 'react';
const pc = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
export default function P() {
  const [SM, PB, H, F8, T, PO, RH] = useLive(['/api/strategy-metrics', '/api/pool-backing', '/api/strategy-history', '/api/strategy-filings', '/api/mstr-tokens', '/api/pools', '/api/robinhood-mstr']);
  const [force8k, setForce8k] = useState(false); useEffect(() => setForce8k(new URLSearchParams(location.search).get('8k') === '1'), []);
  const M = SM?.display || {}, S = PB?.strategy && !PB.strategy.error ? PB.strategy : null;
  const per1M = S ? S.stockInPool / 1e3 : null, p1 = per1M != null ? per1M.toFixed(2) : '—';
  const k8 = eightK(F8, per1M), show8k = k8 && (force8k || isFresh(k8));
  const Y = H?.days?.length ? summarize(H.days) : null, sample = H?.sample, y30 = Y ? pc(Y.yield30d) : '—';
  const tick = [`$STRATEGY ${M.priceUsd || '—'}`, `1M STRATEGY = ${p1} MSTR`, `MSTR YIELD 30D ${y30}${sample ? ' (SAMPLE)' : ''}`, `${M.holders || '—'} HOLDERS`, `POOL HOLDS ${S ? num(S.stockInPool) : '—'} MSTR`].join(' ✦ ') + ' ✦';
  const post = `Every 1M $STRATEGY sits on ${p1} MSTR in the pool. Amplified MSTR. strategycoin.io`;
  const tile = (h, t, s, hot) => <a href={h} style={{ textDecoration: 'none', padding: 22, background: hot ? 'var(--red)' : 'var(--panel)', color: hot ? 'var(--on-red)' : 'var(--ink)', boxShadow: hot ? '5px 5px 0 var(--ink)' : '5px 5px 0 var(--red)' }}><div className="d" style={{ fontSize: 22 }}>{t}</div><div style={{ fontSize: 12, marginTop: 6 }}>{s}</div></a>;
  return (<>
    <section className="hero-red"><div className="in">
      <p className="steps">step 1: hold MSTR<br />step 2: keep holding MSTR<br />step 3: hold the thing that holds MSTR</p>
      <h1>HOLD.<br />HOLD.<br /><span>AMPLIFY.</span></h1>
      <p className="lede">STRATEGY is a memecoin paired with real tokenized MSTR on Robinhood Chain. MSTR is amplified bitcoin. STRATEGY is amplified MSTR.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}><a className="pillbtn" href="#buy" style={{ background: '#ffffff', color: '#b51d27' }}>BUY $STRATEGY</a><a className="pillbtn" href="#ways" style={{ background: 'var(--bg)', color: '#ffffff' }}>STAKE · SOON</a></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}><CopyAddr label="$STRATEGY" addr={ADDR.STRATEGY} /><CopyAddr label="MSTR · ROBINHOOD" addr={ADDR.MSTR} /></div>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, margin: '10px 0 0', color: '#ffe3e5' }}>Both live on Robinhood Chain. Add them to your wallet so you can see the pair.</p>
      <div className="sticker" aria-label="MSTR per 1M STRATEGY"><b>{p1}</b><span>MSTR PER 1M COINS</span></div>
    </div></section>
    <div className="ticker" aria-label="STRATEGY at a glance"><div><span>{tick}</span><span aria-hidden="true">{tick}</span></div></div>
    <Actions bare pools={(PO?.pools || []).slice(0, 10).map(p => ({ id: p.id, name: p.pair, dex: p.dex, liq: fmt(p.liquidityUsd), vol: fmt(p.volume24hUsd) }))} asOf={PO?.fetchedAt?.slice(0, 10) || ''} />
    {show8k && <EightKBanner k={k8} />}

    <section id="stack"><h2 className="sec-h">The stack</h2><p className="sub" style={{ margin: '0 0 28px' }}>If MSTR is amplified BTC, STRATEGY is amplified MSTR. Three layers, one trade.</p>
      <div className="g3">
        <div className="layer" style={{ background: 'var(--panel)' }}><div className="k">Layer 01</div><div className="d">$BTC</div><div className="say" style={{ fontSize: 13 }}>Strategy holds {F8?.latest ? num(F8.latest.btcHeld) : '—'} BTC. Hardest money on earth.</div></div>
        <div className="layer" style={{ background: 'var(--ink)', color: 'var(--bg)' }}><div className="k" style={{ color: 'var(--bg)' }}>Layer 02</div><div className="d">$MSTR</div><div className="say" style={{ fontSize: 13 }}>Amplified bitcoin, now a token, trading 24/7 on Robinhood Chain.</div></div>
        <div className="layer" style={{ background: 'var(--red)', color: 'var(--on-red)', boxShadow: '6px 6px 0 var(--ink)' }}><div className="k" style={{ color: 'var(--on-red)' }}>Layer 03</div><div className="d">$STRATEGY</div><div className="say" style={{ fontSize: 13 }}>Every 1M coins = {p1} MSTR in the pool. Amplified MSTR. You are here.</div></div>
      </div></section>

    <ShareOfSupply S={S} RH={RH} />

    <section id="ways" style={{ scrollMarginTop: 16 }}><h2 className="sec-h">Two ways to win</h2>
      <div className="g2" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 28 }}>
        <div style={{ background: 'var(--panel)', padding: 28 }}><div className="d" style={{ fontSize: 26 }}>01 · Hold</div><div className="k" style={{ margin: '6px 0 18px' }}>like MSTR · accretion</div><div className="big red" style={{ fontSize: 64 }}>{y30}</div>{sample && <span className="tag sample" style={{ marginLeft: 0 }} title="Placeholder history until daily snapshots are connected">SAMPLE</span>}<div className="say" style={{ fontSize: 13 }}>MSTR Yield, 30 days. Trading fees add MSTR to the pool, so each coin holds more MSTR. Price pumps don’t count. Fees do.</div></div>
        <div style={{ border: '2px dashed var(--red-t)', padding: 28 }}><div className="d" style={{ fontSize: 26, color: 'var(--red-t)' }}>02 · Stake</div><div className="k" style={{ margin: '6px 0 18px' }}>like STRC</div><div className="big" style={{ fontSize: 64 }}>SOON</div><div className="say" style={{ fontSize: 13 }}>Staking for STRATEGY holders. Details on @strategystock.</div></div>
      </div></section>

    <section style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
      <div style={{ flex: '999 1 460px', minWidth: 0 }}><h2 className="sec-h" style={{ marginBottom: 22 }}>Flex your stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
          <div className="stat"><div className="k">MSTR held</div><b>{S ? num(S.stockInPool) : '—'}</b></div>
          <div className="stat"><div className="k">MSTR per 1M</div><b style={{ color: 'var(--red-t)' }}>{p1}</b></div>
          <div className="stat"><div className="k">Holders</div><b>{M.holders || '—'}</b></div>
        </div>
        <a href="/strategy/" style={{ display: 'inline-block', marginTop: 20, color: 'var(--red-t)' }}>All STRATEGY stats →</a></div>
      <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="tilt">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700 }}><span className="d" style={{ fontSize: 18, color: 'var(--red)' }}>$S</span><span>SHARE CARD</span></div>
        <div className="d" style={{ fontSize: 36, margin: '18px 0 6px' }}>1M = {p1} MSTR</div>
        <div style={{ fontSize: 13, lineHeight: 1.55 }}>every 1M STRATEGY sits on {p1} MSTR in the pool. Amplified MSTR.</div>
        <div className="chips2"><span style={{ background: 'var(--bg)', color: 'var(--ink)' }}>{y30} MSTR 30D{sample ? ' · SAMPLE' : ''}</span><span style={{ background: 'var(--red)', color: 'var(--on-red)' }}>{M.holders || '—'} HOLDERS</span></div>
        <a className="btn" href={'https://x.com/intent/post?text=' + encodeURIComponent(post)} target="_blank" rel="noopener" style={{ display: 'block', textAlign: 'center', background: 'var(--bg)', color: 'var(--ink)', boxShadow: 'none', marginTop: 0 }}>post to x</a>
      </div></div></section>

    <section><h2 className="sec-h">Got MSTR? Put it to work.</h2><p className="sub" style={{ margin: '0 0 28px' }}>The one-stop shop for stock token holders. Every MSTR token, every chain, every way to earn.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>{tile('/earn/#fees', 'Earn fees', 'LP pools')}{tile('/earn/#lend', 'Lend', 'Kamino · Morpho')}{tile('/earn/#borrow', 'Borrow', 'Teller · Morpho')}{tile('/earn/#hedge', 'Trade 24/7', 'perps · nights + weekends', 1)}</div></section>

    <section style={{ background: 'var(--red)', color: 'var(--on-red)', padding: 36, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', margin: '72px 0 0' }}>
      <div style={{ flex: '999 1 420px' }}><div className="d" style={{ fontSize: 34, lineHeight: 1.05 }}>{T?.totals?.circ ? num(T.totals.circ) : '—'} MSTR tokens on-chain.</div><div style={{ fontSize: 13, marginTop: 8 }}>{fmt(T?.totals?.mcap)} of MSTR, tokenized and trading 24/7. Every token, every chain.</div></div>
      <a className="btn" href="/mstr/" style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: '5px 5px 0 var(--bg)', marginTop: 0 }}>open the tracker</a></section>
  </>);
}
