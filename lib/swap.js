// Swap engine for Robinhood Chain (StockTokenSwap API: quote, execute, status). Shared by the swap window and the terminal's BUY.EXE.
export const RPC=process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_RPC_URL||'https://rpc.mainnet.chain.robinhood.com',WC_ID=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID||'';
export const DEFAULT_FEE_BPS=25; // assumed 0.25% interface fee (paid to STS operator) when backend omits it
export const API='https://stocktokenswap.com',CHAIN=4663,ZERO='0x0000000000000000000000000000000000000000';
export const ETH={chainId:CHAIN,address:ZERO,symbol:'ETH',decimals:18},MSTR={chainId:CHAIN,address:'0xec262a75e413fafd0df80480274532c79d42da09',symbol:'MSTR',decimals:18},STRAT={chainId:CHAIN,address:'0x168661c52e5922288dfb2b3f323b6cf90eb21e18',symbol:'$STRATEGY',decimals:18},ETH_L1={chainId:1,address:ZERO,symbol:'ETH (Ethereum)',decimals:18};
export const RH={chainId:'0x1237',chainName:'Robinhood Chain',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:[RPC],blockExplorerUrls:['https://robinhoodchain.blockscout.com']};
export const toUnits=(v,d)=>{const [i,f='']=String(v).trim().split('.');if(!/^\d*$/.test(i)||!/^\d*$/.test(f))return null;return (BigInt(i||'0')*10n**BigInt(d)+BigInt((f+'0'.repeat(d)).slice(0,d)||'0')).toString()};
export const fmtN=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:n<1?8:4}):'—'};export const usd=v=>v==null?'—':'$'+Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
export async function call(path,opt={}){const r=await fetch(API+path,{...opt,headers:{Accept:'application/json',...(opt.body?{'Content-Type':'application/json'}:{})}});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||j.message||j.note||'request_failed');e.status=r.status;e.payload=j;throw e}return j}
export async function rpcCall(method,params,url=RPC){const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}).then(r=>r.json());if(r.error)throw new Error(r.error.message);return r.result}
export const L1_RPC='https://ethereum.publicnode.com';
export async function balanceOf(tok,acct){const url=tok.chainId===1?L1_RPC:RPC;const raw=tok.address===ZERO?await rpcCall('eth_getBalance',[acct,'latest'],url):await rpcCall('eth_call',[{to:tok.address,data:'0x70a08231'+acct.slice(2).toLowerCase().padStart(64,'0')},'latest'],url);return BigInt(raw||'0x0')}
export const fromUnits=(b,d)=>{const s=b.toString().padStart(d+1,'0');return (s.slice(0,-d)+'.'+s.slice(-d)).replace(/\.?0+$/,'')};
export const MSTR_TOK=MSTR;
/** Ask a wallet provider for its account. */
export async function useProvider(p){const [a]=await p.request({method:'eth_requestAccounts'});return a}
/** Browser wallet (window.ethereum). Returns {prov, acct}. */
export async function connectInjected(){const p=typeof window!=='undefined'&&window.ethereum;if(!p)throw new Error('No browser wallet found. Try WalletConnect.');return {prov:p,acct:await useProvider(p)}}
/** WalletConnect QR / deep link. Returns {prov, acct}. */
export async function connectWC(){if(!WC_ID)throw new Error('WalletConnect is not configured (NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID).');const {EthereumProvider}=await import('@walletconnect/ethereum-provider');const p=await EthereumProvider.init({projectId:WC_ID,chains:[CHAIN],optionalChains:[1],showQrModal:true,rpcMap:{[CHAIN]:RPC,1:L1_RPC},metadata:{name:'STRATEGY COIN',description:'Buy $STRATEGY on Robinhood Chain',url:location.origin,icons:[location.origin+'/strategy-icon.png']}});await p.connect();return {prov:p,acct:await useProvider(p)}}
export async function ensureChain(prov,id){const hex='0x'+id.toString(16);try{await prov.request({method:'wallet_switchEthereumChain',params:[{chainId:hex}]})}catch(e){if(e.code===4902&&id===CHAIN)await prov.request({method:'wallet_addEthereumChain',params:[RH]});else throw e}}
export const swapBody=({acct,payTok,recvTok,w,slip})=>({user:acct,originChainId:payTok.chainId,destinationChainId:recvTok.chainId,originCurrency:payTok.address,destinationCurrency:recvTok.address,amount:w,tradeType:'EXACT_INPUT',slippageTolerance:slip});
/** Quotes only work from strategycoin.io (the API checks the origin). */
export const quotesBlockedHere=()=>typeof window!=='undefined'&&!/strategycoin\.io$/.test(location.hostname);
export async function getQuote(args){const y=await call('/api/swap/quote',{method:'POST',body:JSON.stringify(swapBody(args))});if(y.swapsEnabled===false)throw new Error(y.note||'Swaps temporarily unavailable.');return {quote:y.quote,note:y.note}}
/** Execute a quoted swap: switch chain, send each step's transaction, then poll until it settles.
 *  onStatus(message, kind, extra) is called as it goes; kind is working | ok | error | info. Returns {ok, tx}. */
export async function runSwap({prov,acct,payTok,recvTok,w,slip,quote},onStatus=()=>{}){
 const body=swapBody({acct,payTok,recvTok,w,slip});await ensureChain(prov,payTok.chainId);
 const x=await call('/api/swap/execute',{method:'POST',body:JSON.stringify(body)});if(!x.executionAllowed&&x.swapsEnabled===false)throw new Error(x.note||'Swaps disabled.');
 const q=x.quote||x;const rid=q.requestId||x.requestId;let tx=null;
 for(const s of (q.steps||x.steps||[]))for(const it of (s.items||[])){if(/complete/.test(it.status||''))continue;const d={...it.data};delete d.nonce;delete d.gasPrice;delete d.maxFeePerGas;delete d.maxPriorityFeePerGas;if(!d.to)continue;onStatus('Confirm in wallet…','working',{phase:'sign'});tx=await prov.request({method:'eth_sendTransaction',params:[{from:acct,to:d.to,data:d.data||'0x',value:d.value?'0x'+BigInt(d.value).toString(16):'0x0',...(d.gas||d.gasLimit?{gas:'0x'+BigInt(d.gas||d.gasLimit).toString(16)}:{})}]});onStatus('Submitted '+tx.slice(0,10)+'…','working',{phase:'sent',tx})}
 if(rid&&tx)call('/api/swap/status',{method:'POST',body:JSON.stringify({requestId:rid,wallet:acct,originChainId:payTok.chainId,destinationChainId:recvTok.chainId,inputToken:payTok.address,outputToken:recvTok.address,inputAmount:w,estimatedOutput:quote.receiveAmount,txHash:tx,status:'submitted'})}).catch(()=>{});
 if(!rid)return {ok:!!tx,tx};
 for(let i=0;i<90;i++){onStatus('Settling…','working',{phase:'settle',i,n:90,tx});await new Promise(r=>setTimeout(r,2000));try{const s=String((await call('/api/swap/intent-status?requestId='+encodeURIComponent(rid))).status||'').toLowerCase();if(/success|complete|filled/.test(s)){onStatus('Success ✓','ok',{phase:'done',tx});return {ok:true,tx}}if(/fail|refund|error/.test(s)){onStatus('Swap failed.','error',{phase:'failed',tx});return {ok:false,tx}}}catch(e){}}
 onStatus('Still settling — check the explorer.','info',{phase:'slow',tx});return {ok:null,tx};
}
