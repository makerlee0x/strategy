'use client';
import { fmt, num, St } from './data'; import { Panel } from './ui'; import { QUOTES } from './quotes';
const dt = s => s ? new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const F = ({ children }) => <div className="k" style={{ marginTop: 8, textTransform: 'none', letterSpacing: 0 }}>{children}</div>;

/** Strategy's bitcoin from the latest 8-K. */
export function ReserveCard({ F8 }) {
  const L = F8?.latest, ch = F8?.weeklyChangeBtc;
  return <Panel t="Strategy's bitcoin · latest 8-K" r={<St d={F8} s="SEC EDGAR" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: 0 }}>
    <div style={{ padding: 6 }}><div className="k">Bitcoin held</div><div className="big">{L ? num(L.btcHeld) : '—'}</div><div className="say">{L ? `as of ${L.asOf}` : ''}</div></div>
    <div style={{ padding: 6 }}><div className="k">Change vs prior 8-K</div><div className="big red">{ch == null ? '—' : (ch >= 0 ? '+' : '') + num(ch)}</div><div className="say">{F8?.previous ? `since ${F8.previous.asOf}` : ''}{L ? <> · <a href={L.doc} target="_blank" rel="noopener">8-K filed {dt(L.filingDate)} ↗</a></> : ''}</div></div></div></Panel>;
}
/** Share of tokenized-MSTR volume traded while Nasdaq is closed (30 days, all venues). */
export function OffHours({ OH }) {
  const a = OH?.all;
  return <Panel t="24/7 · traded while Nasdaq is closed" r={<St d={OH} s="GECKOTERMINAL + HYPERLIQUID" />}>
    <div className="big red" style={{ fontSize: 72 }}>{a?.d30?.closedPct != null ? a.d30.closedPct.toFixed(0) + '%' : '—'}</div>
    <div className="say">of {fmt(a?.d30?.totalUsd)} in tokenized-MSTR volume over 30 days traded while Nasdaq was closed.</div>
    <F>Nasdaq is closed {OH?.closedHoursPct30 != null ? OH.closedHoursPct30.toFixed(0) + '%' : '—'} of the hours in a month. Hourly volume, weighted by the part of each hour outside Nasdaq's regular session.</F></Panel>;
}
/** "In his words" quote strip. Verified quotes only. */
export function Quotes({ n = QUOTES.length }) {
  return <Panel t="In his words · Michael Saylor on tokenization" r={<span className="k">verified quotes</span>}><div className="news">{QUOTES.slice(0, n).map((x, i) => <a key={x.url} className="newsrow" href={x.url} target="_blank" rel="noopener"><span className="stamp" style={{ fontSize: 22, margin: 0 }}>{String(i + 1).padStart(2, '0')}</span><span style={{ flex: 1 }}>“{x.q}”</span><span className="k" style={{ whiteSpace: 'nowrap' }}>{dt(x.d)} · {x.src} ↗</span></a>)}</div>
    <F>Quotes refer to tokenized Strategy securities in general. Michael Saylor and Strategy do not endorse this site, Robinhood Chain or the STRATEGY coin.</F></Panel>;
}
/** Collateral table. */
export function Collateral({ C }) {
  return <Panel t="Collateral table · where tokenized MSTR is accepted" r={<St d={C} s="DEFILLAMA + MORPHO" />}><table><thead><tr><th>Protocol</th><th>Chain</th><th>Collateral</th><th>LTV</th><th>Borrow</th><th>Borrow APY</th><th>Collateral supplied</th><th></th></tr></thead><tbody>
    {(C?.rows || []).map((r, i) => <tr key={i}><td><b>{r.protocol}</b></td><td>{r.chain}</td><td>{r.token}</td><td>{r.maxLtvPct != null ? r.maxLtvPct.toFixed(r.maxLtvPct % 1 ? 1 : 0) + '% ' + (r.ltvKind === 'liquidation' ? 'liq.' : 'max') : 'not published'}</td><td>{r.borrowAsset}</td><td>{r.borrowApyPct != null ? r.borrowApyPct.toFixed(2) + '%' : '—'}</td><td>{r.suppliedUsd != null ? fmt(r.suppliedUsd) : '—'}</td><td><a href={r.url} target="_blank" rel="noopener">Open ↗</a></td></tr>)}</tbody></table>
    <F>Kamino: max LTV and supplied collateral from DefiLlama; the borrow rate depends on what you borrow. Morpho: liquidation LTV, rates and sizes from the Morpho API; many markets are very small. Teller: accepts MSTR and STRATEGY for fixed-term loans; it doesn’t publish terms per asset. Loans can be liquidated.</F></Panel>;
}

/** Robinhood volume vs Solana TVL — use vs money sitting idle. All chains listed. */

/** Where tokenized MSTR trades: 24h DEX volume by chain, chains with trades only. */
export function ChainActivity({ CH }) {
  const L = (CH?.chains || []).filter(y => !y.error && !y.noDexData && y.vol24Usd > 0).slice(0, 5), quiet = (CH?.chains || []).filter(y => !L.includes(y)).map(y => y.chain);
  return <Panel t="Where MSTR trades · 24h DEX volume" r={<St d={CH} s="GECKOTERMINAL" />}>
    {L.length ? <table><thead><tr><th>#</th><th>Chain</th><th>24h volume</th><th>Share</th></tr></thead><tbody>{L.map((y, i) => <tr key={y.key} style={y.key === 'robinhood' ? { background: 'rgba(217,35,46,.12)' } : undefined}><td style={{ color: 'var(--red-t)' }}>{String(i + 1).padStart(2, '0')}</td><td><b>{y.chain}</b></td><td>{fmt(y.vol24Usd)}</td><td>{y.volSharePct != null ? y.volSharePct.toFixed(y.volSharePct < 1 ? 1 : 0) + '%' : '—'}</td></tr>)}</tbody></table> : <div className="k">Loading…</div>}
    {quiet.length > 0 && <F>No trades in the last 24h: {quiet.join(', ')}.</F>}</Panel>;
}
