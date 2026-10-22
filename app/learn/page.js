'use client';
import {num,RESOURCES} from '../data';import {Panel} from '../ui';import {useLive} from '../../lib/useLive';import {OffHours,Quotes} from '../backing';
const steps=[['Buy share','A market maker buys real MSTR shares at a broker.'],['Mint','The issuer locks the shares and creates the same number of tokens.'],['Trade','Tokens trade 24/7 on-chain — anyone can buy from the market.'],['Burn','To exit, the market maker returns tokens; they are destroyed and the shares released.']];
export default function P(){const d=useLive('/api/robinhood-mstr');const OH=useLive('/api/offhours');const rh={supply:d?.supply,uiMultiplier:d?.uiMultiplier,mint:{tokens:d?.mintBurn?.minted},burn:{tokens:d?.mintBurn?.burned}};return(<><div className="eyebrow">File 004 — Learn</div><h1 className="d">How it <em>works</em>.</h1><p className="sub" style={{fontSize:15}}>How tokenized MSTR works, and how the STRATEGY pool works.</p>
<Panel t="1 · Where tokens come from"><div className="g4">{steps.map(([a,b],i)=><div key={a}><div className="stamp">{String(i+1).padStart(2,'0')}</div><div className="d" style={{fontSize:22}}>{a}</div><div className="sub">{b}</div></div>)}</div>
<p className="sub" style={{marginTop:12}}>Only approved market makers ("authorized participants") mint and burn. You simply buy and sell. Robinhood mints Mon 02:00 – Sat 02:00 CET; Ondo offers 24/7 mint/redeem on top tokens; xStocks, Dinari and Coinbase use similar KYC-gated desks.</p></Panel>
<Panel t="2 · Why the price stays close to MSTR"><div className="g2"><div className="d" style={{fontSize:24,lineHeight:1.2}}>Token too expensive? Market makers mint more and sell. Too cheap? They buy and burn. Either way, the gap closes.</div><div><div className="k">Robinhood MSTR, since launch</div><div className="stamp">{num(rh.mint.tokens)}</div><div className="k">minted</div><div className="stamp">{num(rh.burn.tokens)}</div><div className="k">burned → {num(rh.supply)} live today</div></div></div></Panel>
<Panel t="3 · What happens with dividends"><p className="sub" style={{fontSize:14}}>MSTR common pays no dividend today. If it ever did, Robinhood tokens would not send cash: a number in the token contract, the <b>multiplier</b>, goes up — so each token represents slightly more than one share. Robinhood MSTR’s multiplier today: <b style={{color:'var(--red-t)'}}>{rh.uiMultiplier!=null?rh.uiMultiplier.toFixed(4):'—'}</b>. xStocks and Ondo also reinvest dividends into the token (net of tax) rather than paying them out.</p></Panel>
<div id="pool" style={{scrollMarginTop:16}}><div className="redblock"><div className="big d" style={{fontSize:36}}>4 · Buy STRATEGY,<br/>pool holds MSTR.</div><div className="rows">
<div><i>01</i><span>Strategy Coin is paired with tokenized MSTR on Robinhood Chain. The main pool pairs STRATEGY with real Robinhood MSTR.</span></div>
<div><i>02</i><span>Buying STRATEGY adds MSTR to the pool; trading fees add more on top.</span></div>
<div><i>03</i><span>Robinhood MSTR is minted by market makers against real shares, so more demand means more minting.</span></div>
<div style={{border:0}}><i>04</i><span>Supply: 1,000,000,000 STRATEGY, fixed at launch.</span></div></div></div></div>
<OffHours OH={OH}/>
<Quotes/>
<div id="metrics" style={{scrollMarginTop:16}}><Panel t="5 · How the STRATEGY metrics work"><table><tbody>{[
['MSTR holdings','MSTR in the STRATEGY/MSTR pool on Robinhood Chain, plus the Strategy Coin Reserve once it exists. Pool MSTR is the pool’s inventory, not a redemption right.'],
['MSTR per 1M STRATEGY','MSTR holdings ÷ 1B coins × 1M. The coin’s version of Strategy’s BTC per share.'],
['STRATEGY mNAV','STRATEGY market cap ÷ (MSTR holdings × MSTR price). Strategy Coin’s own mNAV, not Strategy Inc’s. Above 1× means the market values the coin above the MSTR behind it.'],
['MSTR Yield','MSTR added by trading fees over a period ÷ MSTR holdings at the start. Fee MSTR is pool MSTR above what the launch curve alone would hold at today’s price: the pool starts single-sided, so MSTR on the curve came from buyers and MSTR above it came from fees. MSTR that came in because the price went up is not counted. Shown for 30 days and year-to-date.'],
['Supply','1,000,000,000 STRATEGY, fixed at launch.'],
['Strategy Coin Reserve','Coming soon: creator fees will buy MSTR into a public reserve wallet.'],
['History','One snapshot per day (00:05 UTC). Until enough days are stored, yield and charts use placeholder data marked SAMPLE.']
].map(([a,b])=><tr key={a}><td style={{width:200}}><b>{a}</b></td><td style={{whiteSpace:'normal'}}>{b}</td></tr>)}</tbody></table></Panel></div>
<Panel t="Good to know"><p className="sub">Tokens give price exposure, not shareholder votes. Most issuers exclude US persons. Check each issuer’s terms.</p></Panel>
<Panel t="Resources · the index"><table><thead><tr><th>Ref</th><th>Name</th><th>Address</th></tr></thead><tbody>{RESOURCES.map(([a,b],i)=><tr key={a}><td style={{color:'var(--red-t)'}}>R-{String(i+1).padStart(3,'0')}</td><td><a href={b} target="_blank" rel="noopener"><b>{a}</b></a></td><td>{b.replace('https://','')}</td></tr>)}</tbody></table></Panel></>)}
