'use client';
import { fmt, num, St } from './data'; import { Panel } from './ui'; import { QUOTES } from './quotes';
const sats = n => n == null || !Number.isFinite(n) ? '—' : n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toFixed(n >= 1 ? 2 : 3);
const dt = s => s ? new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const F = ({ children }) => <div className="k" style={{ marginTop: 8, textTransform: 'none', letterSpacing: 0 }}>{children}</div>;

/** Strategy's BTC + USD reserve from the latest 8-K. */
export function ReserveCard({ F8 }) {
  const L = F8?.latest, ch = F8?.weeklyChangeBtc;
  return <Panel t="Strategy reserve · latest 8-K" r={<St d={F8} s="SEC EDGAR" />}><div className="g4">
    <div><div className="k">Bitcoin held</div><div className="big">{L ? num(L.btcHeld) : '—'}</div><div className="say">{L ? `as of ${L.asOf}` : ''}</div></div>
    <div><div className="k">Change vs prior 8-K</div><div className="big red">{ch == null ? '—' : (ch >= 0 ? '+' : '') + num(ch)}</div><div className="say">{F8?.previous ? `since ${F8.previous.asOf}` : ''}</div></div>
    <div><div className="k">USD reserve + cash</div><div className="big">{L?.usdReserve != null ? fmt(L.usdReserve + (L.usdCash || 0)) : '—'}</div><div className="say">{L?.usdReserve != null ? `reserve ${fmt(L.usdReserve)} · cash ${fmt(L.usdCash)}` : ''}</div></div>
    <div><div className="k">Average cost</div><div className="big">{L ? '$' + num(L.avgCostUsd) : '—'}</div><div className="say">{L ? <a href={L.doc} target="_blank" rel="noopener">8-K filed {dt(F8.latest.filingDate)} ↗</a> : ''}</div></div></div></Panel>;
}
/** Sats of Strategy BTC per 1 MSTR share/token, and per STRATEGY coin. */
export function Backing({ F8, SM, coin = true, token = true }) {
  const R = SM?.raw || {}, bps = F8?.btcPerShare, sh = F8?.shares;
  const supply = R.strategySupply || R.totalSupply, mpc = R.mstrInLp != null && supply ? R.mstrInLp / supply : null;
  const satsCoin = mpc != null && bps != null ? mpc * bps * 1e8 : null;
  return <div className={coin && token ? 'g2' : ''}>
    {token && <Panel t="Bitcoin behind 1 MSTR token" r={<St d={F8} s="SEC EDGAR" />}><div className="stamp" style={{ fontSize: 46 }}>{sats(F8?.satsPerShare)} <span style={{ fontSize: 18 }}>sats</span></div><div className="say">≈ {bps != null ? bps.toFixed(6) : '—'} BTC of Strategy’s bitcoin per share. One MSTR token tracks one share.</div>
      <F>Formula: {F8?.latest ? num(F8.latest.btcHeld) : '—'} BTC (8-K, {F8?.latest?.asOf || '—'}) ÷ {sh ? num(sh.total) : '—'} shares (class A + B, {sh?.form || '10-Q'} cover, {sh?.asOf || '—'}). Gross: before Strategy’s debt and preferred claims; shares issued since the cover date are not included.</F></Panel>}
    {coin && <Panel t="Backing per STRATEGY coin" r={<St d={SM} s="STS + SEC" />}><div className="g2" style={{ gridTemplateColumns: '1fr 1fr' }}><div><div className="k">MSTR per 1M coins</div><div className="stamp" style={{ fontSize: 40 }}>{mpc != null ? (mpc * 1e6).toFixed(2) : '—'}</div></div><div><div className="k">Sats per 1M coins</div><div className="stamp" style={{ fontSize: 40, color: '#d9232e' }}>{satsCoin != null ? num(satsCoin * 1e6) : '—'}</div></div></div>
      <F>MSTR per coin = MSTR in the STRATEGY/MSTR pool ({R.mstrInLp != null ? '≈' + num(R.mstrInLp) : '—'}) ÷ total supply ({supply ? (supply / 1e9).toFixed(2) + 'B' : '—'}). Sats per coin = MSTR per coin × {sats(F8?.satsPerShare)} sats per MSTR. Pool MSTR comes from a rounded feed. It is the pool’s inventory, not a redemption right.</F></Panel>}
  </div>;
}
/** Share of tokenized-MSTR volume traded while Nasdaq is closed. */
export function OffHours({ OH, compact }) {
  const a = OH?.all, s = OH?.spot, p = OH?.perp, pc = x => x?.closedPct != null ? x.closedPct.toFixed(0) + '%' : '—';
  return <Panel t="24/7 · traded while Nasdaq is closed" r={<St d={OH} s="GECKOTERMINAL + HYPERLIQUID" />}><div className="g4">
    <div><div className="k">All venues · 30 days</div><div className="big red">{pc(a?.d30)}</div><div className="say">of {fmt(a?.d30?.totalUsd)} volume</div></div>
    <div><div className="k">All venues · 7 days</div><div className="big">{pc(a?.d7)}</div><div className="say">of {fmt(a?.d7?.totalUsd)}</div></div>
    <div><div className="k">DEX spot · 30d</div><div className="big">{pc(s?.d30)}</div><div className="say">Robinhood, Solana, Base pools</div></div>
    <div><div className="k">Perps · 30d</div><div className="big">{pc(p?.d30)}</div><div className="say">Hyperliquid xyz:MSTR</div></div></div>
    {!compact && <><table style={{ marginTop: 14 }}><thead><tr><th>Venue</th><th>30d volume</th><th>Closed-hours share</th></tr></thead><tbody>{(OH?.venues || []).map(v => <tr key={v.name}><td>{v.name}</td><td>{v.error ? 'unavailable' : fmt(v.d30.totalUsd)}</td><td>{v.error ? '—' : pc(v.d30)}</td></tr>)}</tbody></table>
    <F>Method: hourly volume; each hour weighted by the part inside Nasdaq’s regular session (9:30–16:00 ET, Mon–Fri, excluding NYSE holidays; 13:00 early closes). For reference, the market is closed {OH?.closedHoursPct30 != null ? OH.closedHoursPct30.toFixed(0) + '%' : '—'} of all hours.</F></>}
    {compact && <F>Nasdaq is closed {OH?.closedHoursPct30 != null ? OH.closedHoursPct30.toFixed(0) + '%' : '—'} of the hours in a month. Method on /learn.</F>}</Panel>;
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

/** Robinhood volume vs Solana TVL — use vs money sitting idle. */
export function ChainActivity({ CH }) {
  const c = Object.fromEntries((CH?.chains || []).map(x => [x.key, x]));
  const rh = c.robinhood, so = c.solana, top = (CH?.chains || []).filter(x => !x.error && (x.vol24Usd || 0) > 0).slice(0, 5);
  return <Panel t="Where MSTR trades · volume first" r={<St d={CH} s="GECKOTERMINAL + DEFILLAMA" />}><div className="g2">
    <div style={{ border: '2px solid #d9232e', padding: 16 }}><span className="pill">Primary · use</span><div className="d" style={{ fontSize: 28, margin: '10px 0 4px' }}>Robinhood Chain</div>
      <div className="k">24h DEX volume</div><div className="stamp" style={{ fontSize: 48, color: '#d9232e' }}>{fmt(rh?.vol24Usd)}</div>
      <div className="say">DEX liquidity {fmt(rh?.dexLiquidityUsd)}. Volume is money that changed hands — the primary signal of use.</div></div>
    <div style={{ border: '1px solid #1b1916', padding: 16 }}><span className="pill" style={{ background: '#1b1916' }}>Secondary · parked capital</span><div className="d" style={{ fontSize: 28, margin: '10px 0 4px' }}>Solana</div>
      <div className="k">DeFi TVL (lending + pools)</div><div className="stamp" style={{ fontSize: 48 }}>{fmt(so?.defiTvlUsd)}</div>
      <div className="say">24h DEX volume only {fmt(so?.vol24Usd)}. High TVL can sit unused — lending and LP deposits that rarely trade. Volume shows activity; TVL does not.</div></div></div>
    {top.length > 0 && <table style={{ marginTop: 14 }}><thead><tr><th>#</th><th>Chain</th><th>24h volume</th><th>Share</th><th>DEX liquidity</th><th>DeFi TVL</th></tr></thead><tbody>{top.map((x, i) => <tr key={x.key} style={x.key === 'robinhood' ? { background: 'rgba(217,35,46,.08)' } : undefined}><td style={{ color: '#d9232e' }}>{String(i + 1).padStart(2, '0')}</td><td><b>{x.chain}</b>{x.key === 'robinhood' ? ' · featured' : ''}</td><td>{fmt(x.vol24Usd)}</td><td>{x.volSharePct != null ? x.volSharePct.toFixed(0) + '%' : '—'}</td><td>{fmt(x.dexLiquidityUsd)}</td><td>{x.defiTvlUsd != null ? fmt(x.defiTvlUsd) : (x.key === 'robinhood' ? 'not on DefiLlama' : '—')}</td></tr>)}</tbody></table>}
    <F>Volume and DEX liquidity from GeckoTerminal for each tokenized-MSTR contract on that chain. DeFi TVL from DefiLlama (DEX + lending pools with MSTR tokens). DefiLlama does not list Robinhood Chain, so its DeFi TVL is blank — use DEX liquidity instead.</F></Panel>;
}
