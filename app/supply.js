'use client';
// Share of supply: Strategy's share of all bitcoin vs the STRATEGY pool's share of all Robinhood MSTR. 1 square = 1%.
import { num, St } from './data';
const BTC_CAP = 21e6;
function Grid({ pct, on, off, label }) {
  const full = pct == null ? 0 : Math.floor(pct), frac = pct == null ? 0 : pct - full;
  return <div className="grid100" role="img" aria-label={label}>{Array.from({ length: 100 }, (_, i) => <i key={i} style={{ background: i < full ? on : i === full && frac > 0 ? `linear-gradient(90deg, ${on} ${Math.round(frac * 100)}%, ${off} ${Math.round(frac * 100)}%)` : off }} />)}</div>;
}
export default function ShareOfSupply({ F8, S, RH }) {
  const btc = F8?.latest?.btcHeld, btcPct = btc ? btc / BTC_CAP * 100 : null;
  const pool = S?.stockInPool, rh = RH?.supply, poolPct = pool != null && rh ? pool / rh * 100 : null;
  const post = `Strategy owns ${btcPct != null ? btcPct.toFixed(2) : '—'}% of all bitcoin. The $STRATEGY pool holds ${poolPct != null ? poolPct.toFixed(2) : '—'}% of all Robinhood MSTR. strategycoin.io`;
  return <section id="supply"><div className="eyebrow" style={{ marginTop: 72 }}>Share of supply</div>
    <h2 className="sec-h" style={{ marginTop: 10 }}>Saylor stacks bitcoin.<br />We stack MSTR.</h2>
    <p className="sub" style={{ margin: '0 0 32px' }}>Strategy owns a slice of every bitcoin that will ever exist. The STRATEGY pool owns a slice of every MSTR token on Robinhood Chain. Each square is 1%.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 26 }}>
      <div style={{ background: 'var(--panel)', padding: 26, boxShadow: '6px 6px 0 var(--red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}><span>STRATEGY INC. OWNS</span><St d={F8} s="SEC EDGAR" /></div>
        <div className="big" style={{ fontSize: 72, marginTop: 16 }}>{btcPct != null ? btcPct.toFixed(2) + '%' : '—'}</div><div style={{ fontSize: 14, marginTop: 6 }}>of all bitcoin that will ever exist</div>
        <Grid pct={btcPct} on="var(--ink)" off="#5a2226" label={`${btcPct != null ? btcPct.toFixed(2) : '—'}% of 100 squares filled`} />
        <div className="k" style={{ textTransform: 'none', letterSpacing: 0 }}>{btc ? num(btc) : '—'} of 21,000,000 BTC · 8-K{F8?.latest?.asOf ? ', ' + F8.latest.asOf : ''}</div></div>
      <div style={{ background: 'var(--red)', color: 'var(--on-red)', padding: 26, boxShadow: '6px 6px 0 var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}><span>THE STRATEGY POOL HOLDS</span><span className="tag" style={{ marginLeft: 0 }}>ON-CHAIN</span></div>
        <div className="big" style={{ fontSize: 72, marginTop: 16 }}>{poolPct != null ? poolPct.toFixed(2) + '%' : '—'}</div><div style={{ fontSize: 14, marginTop: 6 }}>of all Robinhood MSTR on-chain</div>
        <Grid pct={poolPct} on="#ffffff" off="#9e1820" label={`${poolPct != null ? poolPct.toFixed(2) : '—'}% of 100 squares filled`} />
        <div style={{ fontSize: 12 }}>{pool != null ? num(pool) : '—'} of {rh ? num(rh) : '—'} MSTR tokens · Robinhood Chain</div></div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginTop: 30 }}>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, maxWidth: 700, color: 'var(--mu)' }}>Every STRATEGY buy adds MSTR to the pool, so the pool’s share grows with the community. Pool MSTR is the pool’s inventory, not a redemption right.</p>
      <a className="btn" href={'https://x.com/intent/post?text=' + encodeURIComponent(post)} target="_blank" rel="noopener" style={{ marginTop: 0 }}>post to x</a></div>
  </section>;
}
