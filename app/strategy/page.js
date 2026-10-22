'use client';
// STRATEGY stats: the numbers behind the coin. The landing page (/) links here.
import { fmt, St } from '../data'; import { Panel } from '../ui'; import Actions from './Modals'; import Chart from './Chart'; import { useLive } from '../../lib/useLive'; import Metrics from './Metrics';
const CA = '0x168661c52e5922288dfb2b3f323b6cf90eb21e18';
const L = [['Explorer', 'https://robinhoodchain.blockscout.com/token/' + CA], ['Long', 'https://app.long.xyz/tokens/' + CA], ['FOMO', 'https://fomo.family/coin?address=' + CA + '&chainId=4663&r=0xmakerlee&source=share_link'], ['Dexscreener', 'https://dexscreener.com/robinhood/0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0'], ['@strategystock', 'https://x.com/strategystock'], ['Learn more', 'https://robinhood.com/rhj/stocktokens/']];
export default function P() {
  const [SM, PO] = useLive(['/api/strategy-metrics', '/api/pools']); const PB = useLive('/api/pool-backing'); const H = useLive('/api/strategy-history');
  const M = SM?.display || {}, pools = PO?.pools || [];
  const box = (k, v, red) => <div><div className="k">{k}</div><div className="stamp" style={{ fontSize: 30, color: red ? 'var(--red-t)' : 'var(--ink)' }}>{v ?? '—'}</div></div>;
  return (<><div className="eyebrow">File 000 · The coin · {SM?.fetchedAt ? 'Updated ' + new Date(SM.fetchedAt).toLocaleTimeString() : 'Loading'} · <St d={SM} /></div>
    <h1 className="d">$STRATEGY <em>stats.</em></h1><p className="sub" style={{ fontSize: 15 }}>Strategy Coin is paired with tokenized MSTR on Robinhood Chain. These are the numbers behind it: what the pool holds and how it grows.</p>
    <Actions links={L} asOf={PO?.fetchedAt?.slice(0, 10) || ''} pools={pools.slice(0, 10).map(p => ({ id: p.id, name: p.pair, dex: p.dex, liq: fmt(p.liquidityUsd), vol: fmt(p.volume24hUsd) }))} />
    <Metrics PB={PB} H={H} />
    <Panel t="The coin" r={<St d={SM} s="STS" />}><div className="g3" style={{ gap: 14 }}>{box('Price', M.priceUsd ? M.priceUsd + (M.change24h ? ' · ' + M.change24h : '') : null)}{box('Market cap', M.marketCap, 1)}{box('Holders', M.holders)}{box('Pool size', M.liquidityUsd)}{box('24h volume', M.volume24h, 1)}</div></Panel>
    <Chart />
    <Panel t="Strategy Coin Reserve" r={<span className="tag sample">COMING SOON</span>}><div className="d" style={{ fontSize: 26 }}>Coming soon</div><p className="sub">Creator fees will buy MSTR into a public Strategy Coin Reserve wallet.</p></Panel></>);
}
