'use client';
import { useState } from 'react'; import { useLive } from '../../lib/useLive'; import { St } from '../data';
const R = { '1D': [15, 1], '7D': [60, 7], '30D': [240, 30] };
export default function Chart() {
  const [r, setR] = useState('7D'); const [res, days] = R[r];
  const d = useLive(`/api/charts?resolution=${res}&rangeDays=${days}`);
  const c = d?.candles || []; const W = 1100, H = 220;
  let body = <div className="k" style={{ padding: 30 }}>{d ? 'Chart unavailable right now.' : 'Loading chart…'}</div>;
  if (c.length > 1) {
    const hi = Math.max(...c.map(x => x.high)), lo = Math.min(...c.map(x => x.low)), y = v => H - 10 - (v - lo) / (hi - lo || 1) * (H - 20), x = i => i * W / (c.length - 1);
    const vmax = Math.max(...c.map(x => x.volume)) || 1;
    body = <svg viewBox={`0 0 ${W} ${H + 50}`} width="100%" role="img" aria-label={`STRATEGY price, ${r}`}>
      {[0, .25, .5, .75, 1].map(f => <line key={f} x1="0" x2={W} y1={10 + f * (H - 20)} y2={10 + f * (H - 20)} stroke="#f3e6dc22" />)}
      {c.map((k, i) => <line key={'v' + i} x1={x(i)} x2={x(i)} y1={H + 50} y2={H + 50 - k.volume / vmax * 40} stroke="#f3e6dc" strokeWidth="1.5" />)}
      <polyline fill="none" stroke="#ff5a63" strokeWidth="2.2" points={c.map((k, i) => `${x(i)},${y(k.close)}`).join(' ')} />
      <circle cx={x(c.length - 1)} cy={y(c[c.length - 1].close)} r="6" fill="#ff5a63" />
      <text x="4" y="22" fontSize="12" fontFamily="IBM Plex Mono" fill="#c7aaa3">${hi.toPrecision(3)}</text><text x="4" y={H - 4} fontSize="12" fontFamily="IBM Plex Mono" fill="#c7aaa3">${lo.toPrecision(3)}</text></svg>;
  }
  return <div className="panel"><div className="ph"><span>STRATEGY price · {r}</span><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{Object.keys(R).map(k => <button key={k} className={'chip' + (k === r ? ' on' : '')} onClick={() => setR(k)}>{k}</button>)}<St d={d} s={(d?.source || 'live').toUpperCase()} /></span></div><div className="pb">{body}</div></div>;
}
