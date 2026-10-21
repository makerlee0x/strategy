'use client';
import { num, St } from '../data'; import { Panel, Spark } from '../ui'; import { summarize } from '../../lib/metrics.mjs';
const pc = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
const dt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
/** STRATEGY's Saylor-style metrics: MSTR held, MSTR per 1M coins, fee-driven MSTR Yield, mNAV. */
export default function Metrics({ PB, H, F8 }) {
  const s = PB?.strategy, live = s && !s.error ? s : null, S = H?.days?.length ? summarize(H.days) : null, sample = H?.sample;
  const hold = live ? live.stockInPool : null, per1M = hold != null ? hold / 1e9 * 1e6 : null, fee = live ? Math.max(0, live.stockInPool - live.curveStock) : null;
  const sats = per1M != null && F8?.satsPerShare ? per1M * F8.satsPerShare : null, mnav = live && hold ? live.mcapUsd / (hold * live.stockUsd) : null;
  const tile = (k, v, say, red) => <div><div className="k">{k}</div><div className={'big' + (red ? ' red' : '')} style={{ fontSize: 46 }}>{v}</div><div className="say" style={{ fontSize: 13 }}>{say}</div></div>;
  const Tag = () => sample ? <span className="tag sample" title="Placeholder history until daily snapshots are connected">SAMPLE</span> : null;
  return <Panel t="STRATEGY metrics · MSTR accretion" r={<St d={PB} s="DEXSCREENER + ON-CHAIN" />}>
    <div className="g4 tight">{tile('MSTR holdings', hold != null ? num(hold) : '—', 'MSTR in the STRATEGY/MSTR pool. Treasury: coming soon.')}{tile('MSTR per 1M STRATEGY', per1M != null ? per1M.toFixed(2) : '—', 'Holdings ÷ 1B coins × 1M.', 1)}{tile('Sats per 1M STRATEGY', sats != null ? num(sats) : '—', 'Through Strategy’s BTC per share.')}{tile('mNAV', mnav != null ? mnav.toFixed(1) + '×' : '—', 'Market cap ÷ value of MSTR held.')}</div>
    <div className="g4 tight" style={{ borderTop: '1px solid var(--rule)' }}>
      {tile(<>MSTR Yield · 30D <Tag /></>, pc(S?.yield30d), 'MSTR added by fees ÷ holdings 30 days ago.', 1)}
      {tile(<>MSTR Yield · QTD <Tag /></>, pc(S?.yieldQtd), 'Since the start of the quarter.', 1)}
      {tile(<>MSTR Yield · {S?.ytdFrom ? 'since ' + dt(S.ytdFrom) : 'YTD'} <Tag /></>, pc(S?.yieldYtd), S?.ytdFrom ? 'Since the first day on record.' : 'Since Jan 1.', 1)}
      <div><div className="k">MSTR from fees</div><div className="big" style={{ fontSize: 46 }}>{fee != null ? num(fee) : '—'}</div>{S?.series?.length > 1 && <><Spark pts={S.series.map(x => x.feePer1M)} w={220} h={40} /><div className="k" style={{ textTransform: 'none', letterSpacing: 0 }}>Fee MSTR per 1M coins, {dt(S.series[0].d)} → {dt(S.asOf)} <Tag /></div></>}</div></div>
    <div className="g2" style={{ gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--rule)', paddingTop: 12, gap: 12 }}><div><span className="k">Treasury MSTR</span> <span className="tag sample">COMING SOON</span><div className="k" style={{ textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>Creator fees will buy MSTR into a public wallet; each buy adds to MSTR Yield.</div></div><div><span className="k">STRATEGY staked on Carry</span> <span className="tag sample">COMING SOON</span></div></div>
    <div className="k" style={{ marginTop: 12, textTransform: 'none', letterSpacing: 0 }}>MSTR Yield counts only MSTR added by fees (pool MSTR above the launch curve, plus treasury buys later), not MSTR that came in because the price went up.{sample ? ' Yield and chart use placeholder history (SAMPLE) until daily snapshots are connected.' : ''} <a href="/learn/#metrics">How each metric is calculated →</a></div>
  </Panel>;
}
