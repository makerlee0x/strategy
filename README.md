# MSTR On-Chain — strategycoin.io

A Next.js 14 (App Router) hub for tokenized MSTR and the $STRATEGY coin. Built to deploy on Vercel as a regular Next.js app (not a static export).

## Setup
```
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```
Requires Node 18.17 or newer.

## Environment variables
| Name | Purpose |
|---|---|
| STRATEGY_METRICS_URL | Upstream for $STRATEGY metrics (default stocktokenswap) |
| NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID | Turns on WalletConnect in the swap modal |
| NEXT_PUBLIC_ROBINHOOD_CHAIN_RPC_URL | Robinhood Chain RPC (chain 4663) |
| COINGECKO_API_KEY / COINGECKO_PLAN | Optional CoinGecko key; set the plan to `demo` or `pro` |
| MSTR_SHARES_BASIS | Share count used for the "share on-chain" figure |
| VERCEL_PREVIEW_PREFIX | Allows `<prefix>*.vercel.app` preview origins |

## Pages
`/` dashboard · `/strategy` ($STRATEGY coin; `?modal=swap|buy|pools`) · `/opportunities` · `/tokens` · `/learn` · `/tracker` · `/resources`

## API (all server-cached, rate-limited, origin-checked)
| Route | Source | Cache |
|---|---|---|
| /api/strategy-metrics | stocktokenswap (display strings plus parsed `raw` numbers) | 45s |
| /api/pools | GeckoTerminal | 60s |
| /api/charts?resolution=&rangeDays= | stocktokenswap | short |
| /api/x-feed | x.com / fxtwitter | 120s |
| /api/mstr-tokens | CoinGecko markets | 5m |
| /api/robinhood-mstr | Robinhood Chain and Arbitrum RPC (supply, uiMultiplier, mint/burn) | 2m, scan every 10m |
| /api/perps | Hyperliquid and Lighter | 60s |
| /api/defi | DefiLlama yields and Teller | 10m |

When an upstream fails, the route returns `delayed: true` and the last good value, or nothing, and the UI shows "DATA DELAYED". It never shows invented fallback figures. Clients refresh every 60s.

Guard (`lib/guard.js`): per-IP rate limit (browser and anonymous tiers), a UA check, and an origin allowlist (strategycoin.io, www, localhost and Vercel URLs).

Swap uses the stocktokenswap `/api/swap/*` endpoints. It quotes only after a wallet connects, and live quotes work only from strategycoin.io origins because of upstream CORS.

Not affiliated with, endorsed by, or sponsored by Strategy Inc. Informational only, not investment advice.
