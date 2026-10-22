'use client';
import { fmt, num, pct, St } from '../data'; import { useLive } from '../../lib/useLive'; import { ReserveCard, OffHours, ChainActivity } from '../backing'; import { MstrTabs } from '../nav';
export default function P() {
  const [T, SM] = useLive(['/api/mstr-tokens', '/api/strategy-metrics']); const [F8, OH, CH] = useLive(['/api/strategy-filings', '/api/offhours', '/api/chains']);
  const t = T?.totals || {}, M = SM?.display || {};
  return (<><MstrTabs on="dash" /><div className="eyebrow">File 001 · MSTR on-chain · refreshes every 60s</div><h1 className="d">Strategy stock,<br /><em>on-chain.</em></h1><p className="sub" style={{ fontSize: 15 }}>MSTR now trades as a token, 24/7, on blockchains. Here is how much exists and where it trades.</p>
    <a href="/" style={{ textDecoration: 'none' }}><div className="redblock" style={{ gridTemplateColumns: '1.3fr 1fr', marginTop: 0 }}><div className="big d" style={{ fontSize: 44, padding: '22px 18px' }}>$STRATEGY coin<div style={{ fontSize: 15, fontFamily: "'Space Mono', monospace", textTransform: 'none', marginTop: 8 }}>Paired with $MSTR · Tokenized on Robinhood Chain →</div></div>
      <div className="rows"><div><i>Price</i><span>{M.priceUsd || '—'} {M.change24h ? `(${M.change24h})` : ''}</span></div><div><i>Mcap</i><span>{M.marketCap || '—'}</span></div><div><i>MSTR in pool</i><span>{M.mstrInLp || '—'}</span></div><div style={{ border: 0 }}><i>Holders</i><span>{M.holders || '—'} {SM && !SM.ok && <span className="tag delayed" style={{ color: '#fff' }}>DATA DELAYED</span>}</span></div></div></div></a>
    <div className="panel"><div className="ph"><span>Tokenized MSTR · all issuers</span><St d={T} s="LIVE · COINGECKO" /></div><div className="g3" style={{ gap: 0 }}>
      <div style={{ padding: 22 }}><div className="k">MSTR tokens on-chain</div><div className="big">{num(t.circ)}</div><div className="say">worth {fmt(t.mcap)} · 1 token ≈ 1 share</div></div>
      <div style={{ padding: 22 }}><div className="k">Share of MSTR on-chain</div><div className="big">{pct(t.pctShares)}</div><div className="say">of ~{t.sharesBasis ? (t.sharesBasis / 1e6).toFixed(0) : '—'}M shares</div></div>
      <div style={{ padding: 22 }}><div className="k">Traded in the last 24h</div><div className="big red">{fmt(t.vol24)}</div><div className="say">≈ {pct(t.volPctMcap, 0)} of all tokens changed hands</div></div></div></div>
    <ReserveCard F8={F8} />
    <OffHours OH={OH} />
    <ChainActivity CH={CH} /></>);
}
