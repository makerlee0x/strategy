'use client';
import { cg, EXP, ORDER, num, fmt, St } from '../data'; import { Barcode } from '../ui'; import { useLive } from '../../lib/useLive'; import { MstrTabs } from '../nav';
const rank = t => t.id.includes('robinhood') ? 0 : t.platforms['arbitrum-one'] ? 1 : 2;
export default function P() {
  const T = useLive('/api/mstr-tokens'); const m = Object.fromEntries((T?.tokens || []).map(t => [t.id, t])); const list = [...cg.tokens].sort((a, b) => rank(a) - rank(b));
  return (<><MstrTabs on="tokens" /><div className="eyebrow">File 003 — Token directory</div><h1 className="d">Find your <em>token</em>.</h1><p className="sub">Every official tokenized MSTR, its issuer, and its contract on each chain. Robinhood Chain and Arbitrum listed first. Contracts: CoinGecko. Market data: <St d={T} s="LIVE · COINGECKO" /></p>
    {list.map((t, i) => { const k = m[t.id] || {}; const ch = Object.entries(t.platforms).sort((a, b) => (ORDER.indexOf(b[0]) > -1) - (ORDER.indexOf(a[0]) > -1)); return <div className="panel" key={t.id} style={rank(t) === 0 ? { borderColor: '#d9232e', borderWidth: 2 } : {}}><div className="ph"><span>No. {String(i + 1).padStart(3, '0')} · {t.name}</span><Barcode seed={t.id} w={120} h={16} /></div><div className="pb tokgrid">
      <div><div className="stamp" style={{ fontSize: 30 }}>{t.symbol.toUpperCase()}</div><div className="k">In circulation</div><div>{num(k.circ)}</div><div className="k" style={{ marginTop: 6 }}>24h volume</div><div>{fmt(k.vol24)}</div><div className="k" style={{ marginTop: 6 }}><a href={t.home}>Issuer ↗</a> · <a href={'https://www.coingecko.com/en/coins/' + t.id}>CoinGecko ↗</a></div></div>
      <table><thead><tr><th>Chain</th><th>Contract</th></tr></thead><tbody>{ch.map(([c, a]) => <tr key={c}><td>{ORDER.includes(c) ? <b style={{ color: '#d9232e' }}>{EXP[c][0]}</b> : EXP[c]?.[0] || c}</td><td className="addr"><a href={(EXP[c]?.[1] || '#') + a}>{a}</a></td></tr>)}</tbody></table></div></div>; })}</>);
}
