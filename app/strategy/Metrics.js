'use client';
import { num, St } from '../data'; import { Panel } from '../ui'; import { summarize } from '../../lib/metrics.mjs';
const pc = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
const dt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
/** STRATEGY's Saylor-style metrics: MSTR held, MSTR per 1M coins, STRATEGY mNAV, fee-driven MSTR Yield. */
export default function Metrics({ PB, H }) {
  const s = PB?.strategy, live = s && !s.error ? s : null, S = H?.days?.length ? summarize(H.days) : null, sample = H?.sample;
  const hold = live ? live.stockInPool : null, per1M = hold != null ? hold / 1e9 * 1e6 : null;
  const mnav = live && hold ? live.mcapUsd / (hold * live.stockUsd) : null;
  const tile = (k, v, say, red) => <div><div className="k">{k}</div><div className={'big' + (red ? ' red' : '')} style={{ fontSize: 46 }}>{v}</div><div className="say" style={{ fontSize: 13 }}>{say}</div></div>;
  const Tag = () => sample ? <span className="tag sample" title="Placeholder history until daily snapshots are connected">SAMPLE</span> : null;
  return <Panel t="STRATEGY metrics · MSTR accretion" r={<St d={PB} s="DEXSCREENER + ON-CHAIN" />}>
    <div className="g3 tight" style={{ gap: 0 }}>{tile('MSTR holdings', hold != null ? num(hold) : '—', 'MSTR in the STRATEGY/MSTR pool.')}{tile('MSTR per 1M STRATEGY', per1M != null ? per1M.toFixed(2) : '—', 'Holdings ÷ 1B coins × 1M.', 1)}{tile('STRATEGY mNAV', mnav != null ? mnav.toFixed(1) + '×' : '—', 'STRATEGY market cap ÷ value of the MSTR in its pool.')}</div>
    <div className="g2 tight" style={{ gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid var(--rule)' }}>
      {tile(<>MSTR Yield · 30D <Tag /></>, pc(S?.yield30d), 'MSTR added by fees ÷ holdings 30 days ago.', 1)}
      {tile(<>MSTR Yield · {S?.ytdFrom ? 'since ' + dt(S.ytdFrom) : 'YTD'} <Tag /></>, pc(S?.yieldYtd), S?.ytdFrom ? 'Since the first day on record.' : 'Since Jan 1.', 1)}</div>
    <div className="k" style={{ marginTop: 12, textTransform: 'none', letterSpacing: 0 }}>MSTR Yield counts only MSTR added by trading fees (pool MSTR above the launch curve), not MSTR that came in because the price went up.{sample ? ' Yield uses placeholder history (SAMPLE) until daily snapshots are connected.' : ''} <a href="/learn/#metrics">How each metric is calculated →</a></div>
  </Panel>;
}
