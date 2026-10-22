'use client';
import { useLive } from '../../lib/useLive'; import { St } from '../data'; import { EightKCard } from '../eightk'; import { eightK, headline } from '../../lib/eightk.mjs';
export default function P() {
  const [F8, PB] = useLive(['/api/strategy-filings', '/api/pool-backing']);
  const S = PB?.strategy && !PB.strategy.error ? PB.strategy : null, k = eightK(F8, S ? S.stockInPool / 1e3 : null);
  const post = k ? `${headline(k)} Every 1M $STRATEGY now sits on ${Math.round(k.per1MSats || 0).toLocaleString('en-US')} sats of Saylor's bitcoin.` : '';
  return (<><div className="eyebrow">8-K day · latest Strategy filing · <St d={F8} s="SEC EDGAR" /></div>
    <h1 className="d">8-K <em>day.</em></h1><p className="sub" style={{ fontSize: 15 }}>Every time Strategy files a bitcoin 8-K, the new holdings flow through to every MSTR token, and from there to every 1M STRATEGY.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', margin: '18px 0 24px' }}>
      <a className="btn" href={'https://x.com/intent/post?text=' + encodeURIComponent(post) + '&url=' + encodeURIComponent('https://strategycoin.io/8k/')} target="_blank" rel="noopener" style={{ marginTop: 0, background: 'var(--red)', color: 'var(--on-red)', boxShadow: '4px 4px 0 var(--ink)' }}>post to x</a>
      <a className="btn" href="/api/card/8k" download="strategy-8k.png" style={{ marginTop: 0 }}>download image</a>
      {k?.doc && <a href={k.doc} target="_blank" rel="noopener" style={{ color: 'var(--red-t)' }}>Read the 8-K ↗</a>}</div>
    <div className="cardwrap">{k ? <EightKCard k={k} /> : <div className="k">Loading the latest filing…</div>}</div>
    <p className="k" style={{ textTransform: 'none', letterSpacing: 0, marginTop: 16 }}>Sats per MSTR = BTC held ÷ class A + B shares (latest 10-Q/10-K cover), gross of debt and preferred. Sats per 1M STRATEGY = MSTR in the STRATEGY/MSTR pool per 1M coins × sats per MSTR. Pool MSTR is inventory, not a redemption right.</p></>);
}
