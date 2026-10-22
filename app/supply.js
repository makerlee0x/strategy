'use client';
// Share of supply: the STRATEGY pool's share of all Robinhood MSTR. 1 square = 1%.
import { num } from './data'; import { ShareX } from './ui';
function Grid({ pct, on, off, label }) {
  const full = pct == null ? 0 : Math.floor(pct), frac = pct == null ? 0 : pct - full;
  return <div className="grid100" role="img" aria-label={label}>{Array.from({ length: 100 }, (_, i) => <i key={i} style={{ background: i < full ? on : i === full && frac > 0 ? `linear-gradient(90deg, ${on} ${Math.round(frac * 100)}%, ${off} ${Math.round(frac * 100)}%)` : off }} />)}</div>;
}
export default function ShareOfSupply({ S, RH }) {
  const pool = S?.stockInPool, rh = RH?.supply, pct = pool != null && rh ? pool / rh * 100 : null, p = pct != null ? pct.toFixed(2) : '—';
  const post = `The $STRATEGY pool holds ${p}% of all Robinhood MSTR. strategycoin.io`;
  return <section id="supply" style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
    <div style={{ flex: '1 1 340px', minWidth: 0 }}><div className="eyebrow" style={{ marginTop: 72 }}>Share of supply</div>
      <h2 className="sec-h" style={{ marginTop: 10 }}>We stack MSTR.</h2>
      <p className="sub" style={{ margin: '0 0 24px' }}>Saylor stacks bitcoin. The STRATEGY pool stacks MSTR: it owns a slice of every MSTR token on Robinhood Chain. Every buy adds to it. Each square is 1%.</p>
      <ShareX ready={pct != null} text={post} style={{ marginTop: 0 }} />
      <p className="k" style={{ textTransform: 'none', letterSpacing: 0, marginTop: 18 }}>Pool MSTR is the pool’s inventory, not a redemption right.</p></div>
    <div style={{ flex: '999 1 460px', minWidth: 0, background: 'var(--red)', color: 'var(--on-red)', padding: 26, boxShadow: '6px 6px 0 var(--ink)', marginTop: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}><span>THE STRATEGY POOL HOLDS</span><span className="tag" style={{ marginLeft: 0 }}>ON-CHAIN</span></div>
      <div className="big" style={{ fontSize: 72, marginTop: 16 }}>{pct != null ? p + '%' : '—'}</div><div style={{ fontSize: 14, marginTop: 6 }}>of all Robinhood MSTR on-chain</div>
      <Grid pct={pct} on="#ffffff" off="#9e1820" label={`${p}% of 100 squares filled`} />
      <div style={{ fontSize: 12 }}>{pool != null ? num(pool) : '—'} of {rh ? num(rh) : '—'} MSTR tokens · Robinhood Chain</div></div>
  </section>;
}
