'use client';
import { useEffect, useMemo, useState } from 'react';
import { fmt, num, St } from '../data'; import { Panel } from '../ui';
const MIN = 1e6, MAX = 1e9, PRESETS = [5e6, 10e6, 50e6, 100e6, 1e9];
const lab = v => v >= 1e9 ? '$' + +(v / 1e9).toFixed(2) + 'B' : '$' + +(v / 1e6).toFixed(v < 1e7 ? 1 : 0) + 'M';
const toHash = v => v >= 1e9 ? +(v / 1e9).toFixed(3) + 'b' : +(v / 1e6).toFixed(2) + 'm';
const fromHash = h => { const m = /mc=([\d.]+)([mbk]?)/i.exec(h || ''); if (!m) return null; const v = +m[1] * ({ k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()] || 1); return Number.isFinite(v) ? Math.min(MAX, Math.max(MIN, v)) : null; };
const F = ({ children }) => <div className="k" style={{ marginTop: 8, textTransform: 'none', letterSpacing: 0 }}>{children}</div>;
/** Model: MSTR in pool ≈ L × (√p − √p_launch) × f, p = market cap in MSTR ÷ 1B supply. */
export function model(S, mcapUsd) {
  if (!S?.L || !S.stockUsd) return null;
  const p = mcapUsd / S.stockUsd / 1e9, sp = Math.sqrt(Math.min(p, S.pTop)), sa = Math.sqrt(S.pLaunch), st = Math.sqrt(S.pTop);
  const curve = Math.max(0, S.L * (sp - sa)), f = S.f || 1, mstr = curve * f;
  const coinsLeft = S.L * (1 / sp - 1 / st) + (S.L2 || 0) / st;
  return { mstr, usd: mstr * S.stockUsd, pct: mstr * S.stockUsd / mcapUsd * 100, coinsLeft, above: p > S.pTop };
}
export default function PoolBacking({ D, F8 }) {
  const S = D?.strategy, bps = F8?.btcPerShare;
  const [mc, setMc] = useState(1e8);
  useEffect(() => { const h = fromHash(location.hash); if (h) setMc(h); const on = () => { const v = fromHash(location.hash); if (v) setMc(v); }; addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  const set = v => { setMc(v); history.replaceState(null, '', '#mc=' + toHash(v)); };
  const r = model(S, mc), now = S ? { mc: S.mcapUsd, mstr: S.stockInPool, pct: S.backingPct } : null;
  const formula = S ? `MSTR in pool ≈ L × (√p − √p_launch) × f, with p = market cap in MSTR ÷ 1B coins. L = ${num(S.L)} (on-chain launch range), launch at ≈ ${num(S.launchMcapStock)} MSTR market cap (≈ ${fmt(S.launchMcapStock * S.stockUsd)}), f = ${S.f?.toFixed(2)} (live pool MSTR ÷ curve), MSTR = ${fmt(S.stockUsd)}.` : '';
  // chart
  const W = 720, H = 300, pl = 54, pr = 50, pt = 16, pb = 34, lx = v => pl + (Math.log10(v) - 6) / 3 * (W - pl - pr);
  const pts = useMemo(() => S ? Array.from({ length: 61 }, (_, i) => { const v = Math.pow(10, 6 + i / 20); return { v, ...model(S, v) }; }) : [], [S]);
  const ymax = Math.max(1, ...pts.map(p => p.mstr)) * 1.08, pmax = Math.max(12, ...pts.map(p => p.pct), now?.pct || 0, ...(D?.others || []).map(o => o.backingPct || 0)) * 1.1;
  const ly = v => pt + (1 - v / ymax) * (H - pt - pb), ry = v => pt + (1 - v / pmax) * (H - pt - pb);
  const big = (k, v, red, sub) => <div><div className="k">{k}</div><div className="stamp" style={{ fontSize: 32, color: red ? '#d9232e' : '#1b1916' }}>{v ?? '—'}</div>{sub && <div className="k" style={{ textTransform: 'none', letterSpacing: 0 }}>{sub}</div>}</div>;
  return <Panel t="Pool backing · what if the market cap grows?" r={<St d={D} s="DEXSCREENER + ON-CHAIN" />}>
    <p className="say" style={{ marginTop: 0 }}>When people buy STRATEGY, the pool takes in MSTR. Move the slider to see roughly how much MSTR the pool would hold at a bigger market cap. <span title={formula} style={{ borderBottom: '1px dotted #1b1916', cursor: 'help' }}>How it’s calculated ⓘ</span></p>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
      <span className="k">Market cap</span><span className="stamp" style={{ fontSize: 30, margin: 0 }}>{lab(mc)}</span>
      <input aria-label="Market cap" type="range" min={6} max={9} step={0.005} value={Math.log10(mc)} onChange={e => set(Math.round(Math.pow(10, +e.target.value) / 1e5) * 1e5)} style={{ flex: 1, minWidth: 200, accentColor: '#d9232e' }} />
      {PRESETS.map(v => <button key={v} onClick={() => set(v)} className="tag" style={{ cursor: 'pointer', border: '1px solid #1b1916', background: Math.abs(mc - v) < 1 ? '#d9232e' : 'transparent', color: Math.abs(mc - v) < 1 ? '#f7f1e3' : '#1b1916', padding: '4px 10px' }}>{lab(v)}</button>)}
    </div>
    <div className="g2" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
      {big('MSTR in pool', r ? num(Math.round(r.mstr)) : null, 1, now ? 'now ' + num(Math.round(now.mstr)) : '')}
      {big('Its value', r ? fmt(r.usd) : null)}
      {big('Backing', r ? r.pct.toFixed(r.pct < 1 ? 2 : 1) + '%' : null, 1, 'MSTR value ÷ market cap')}
      {big('STRATEGY left in pool', r ? (r.coinsLeft / 1e6).toFixed(1) + 'M' : null, 0, 'of 1B coins')}
      {big('BTC behind that MSTR', r && bps != null ? (r.mstr * bps).toFixed(2) + ' BTC' : null, 0, r && bps != null ? '≈ ' + num(Math.round(r.mstr * bps * 1e8)) + ' sats' : '')}
    </div>
    {S && <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', marginTop: 14, background: '#fbf7ec', border: '1px solid #1b1916' }} role="img" aria-label="MSTR in pool and backing percent versus market cap">
      {[1e6, 1e7, 1e8, 1e9].map(v => <g key={v}><line x1={lx(v)} x2={lx(v)} y1={pt} y2={H - pb} stroke="#1b191622" /><text x={lx(v)} y={H - 14} fontSize="11" textAnchor="middle" fill="#1b1916">{lab(v)}</text></g>)}
      {[0, .5, 1].map(t => <g key={t}><text x={pl - 6} y={ly(ymax * t / 1.08) + 4} fontSize="10" textAnchor="end" fill="#d9232e">{num(Math.round(ymax * t / 1.08))}</text><text x={W - pr + 6} y={ry(pmax * t / 1.1) + 4} fontSize="10" fill="#1b1916">{(pmax * t / 1.1).toFixed(0)}%</text></g>)}
      <text x={pl} y={pt - 4} fontSize="10" fill="#d9232e">MSTR IN POOL</text><text x={W - pr} y={pt - 4} fontSize="10" textAnchor="end" fill="#1b1916">BACKING %</text>
      <polyline fill="none" stroke="#d9232e" strokeWidth="2.4" points={pts.map(p => `${lx(p.v)},${ly(p.mstr)}`).join(' ')} />
      <polyline fill="none" stroke="#1b1916" strokeWidth="1.6" strokeDasharray="5 4" points={pts.map(p => `${lx(p.v)},${ry(p.pct)}`).join(' ')} />
      {(D?.others || []).filter(o => !o.error && o.mcapUsd >= MIN && o.mcapUsd <= MAX).map(o => <g key={o.key}><rect x={lx(o.mcapUsd) - 4} y={ry(o.backingPct) - 4} width="8" height="8" fill="#f7f1e3" stroke="#1b1916" /><text x={lx(o.mcapUsd) + 7} y={ry(o.backingPct) - 6} fontSize="10" fill="#1b1916">{o.key}/{o.stock} {o.backingPct.toFixed(1)}%</text></g>)}
      {r && <line x1={lx(mc)} x2={lx(mc)} y1={pt} y2={H - pb} stroke="#d9232e" strokeDasharray="2 3" />}
      {r && <circle cx={lx(mc)} cy={ly(r.mstr)} r="4" fill="#f7f1e3" stroke="#d9232e" strokeWidth="2" />}
      {now?.mc >= MIN && <g><circle cx={lx(now.mc)} cy={ly(now.mstr)} r="6" fill="#d9232e" /><text x={lx(now.mc) + 9} y={ly(now.mstr) - 6} fontSize="11" fill="#d9232e">STRATEGY now · {lab(now.mc)}</text></g>}
    </svg>}
    <div className="k" style={{ marginTop: 6, textTransform: 'none', letterSpacing: 0 }}>Red line: MSTR in pool (left). Dashed line: backing % (right). Red dot: today. Squares: other LONG coins today (AI/NVDA, BONER/HIMS, MEME/AMC), backing % only, shown for comparison.</div>
    <F>Estimate, not a forecast. It assumes nobody adds or removes liquidity, the fee uplift f stays at today’s {S?.f ? S.f.toFixed(2) : '—'} (it varies with trading volume), and MSTR stays at {S ? fmt(S.stockUsd) : '—'}. The curve is in MSTR terms, so a change in MSTR’s price shifts it. The launch range ends near {S ? lab(S.rangeTopMcapStock * S.stockUsd) : '$1.27B'}; above that a second range takes over and this model stops. Pool MSTR is the pool’s inventory, not a redemption right. BTC uses Strategy’s gross BTC per share from the latest 8-K.</F>
  </Panel>;
}
