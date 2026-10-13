import { preflight, cachedFetch, json } from '../../../lib/guard';
export const dynamic = 'force-dynamic';
const SCREEN = 'strategystock', PROFILE_URL = `https://x.com/${SCREEN}`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const clean = (s, max = 480) => s == null ? '' : String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
async function get(url, asJson, ms = 12000) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { const r = await fetch(url, { signal: c.signal, cache: 'no-store', headers: { 'User-Agent': UA, Accept: asJson ? 'application/json' : 'text/html,application/json', 'Accept-Language': 'en-US,en;q=0.9' }, redirect: 'follow' }); if (!r.ok) throw new Error('http_' + r.status); return asJson ? r.json() : r.text(); } finally { clearTimeout(t); } }
function extractIds(html) { const ids = [...[...html.matchAll(/tweet-(\d{10,})/g)].map(m => m[1]), ...[...html.matchAll(/(?:x\.com|twitter\.com)\/strategystock\/status\/(\d{10,})/gi)].map(m => m[1])]; return [...new Set(ids)].slice(0, 8); }
async function hydrate(id) { const d = await get(`https://api.fxtwitter.com/status/${id}`, true); const t = d?.tweet || {}; const text = clean(t.text || t.raw_text?.text || ''); if (!text) return null;
  return { id: String(id), text, createdAt: clean(t.created_at || t.date || '', 64), url: `https://x.com/${SCREEN}/status/${id}`, likes: typeof t.likes === 'number' ? t.likes : null, reposts: typeof t.retweets === 'number' ? t.retweets : typeof t.reposts === 'number' ? t.reposts : null }; }
async function buildFeed() {
  let profile = { name: 'Strategy Coin', handle: '@' + SCREEN, url: PROFILE_URL, description: '' };
  try { const u = (await get(`https://api.fxtwitter.com/${SCREEN}`, true))?.user || {}; profile = { name: clean(u.name || 'Strategy Coin', 80), handle: '@' + SCREEN, url: PROFILE_URL, description: clean(u.description || '', 240), followers: typeof u.followers === 'number' ? u.followers : null, avatar: clean(u.avatar_url || '', 240) }; } catch (_) {}
  let posts = [], source = 'empty';
  try { const ids = extractIds(await get(PROFILE_URL, false)); posts = (await Promise.all(ids.map(id => hydrate(id).catch(() => null)))).filter(Boolean).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)).slice(0, 6); if (posts.length) source = 'x+fxtwitter'; } catch (_) { source = 'error'; }
  return { ok: posts.length > 0, source, asOf: new Date().toISOString(), profile, posts };
}
export async function OPTIONS(req) { return preflight(req); }
export async function GET(req) {
  const pf = preflight(req, { browser: { limit: 20 }, anon: { limit: 6 }, prefix: 'xfeed' }); if (pf) return pf;
  const origin = req.headers.get('origin') || '';
  try { const { value, cache } = await cachedFetch('x-feed', 120_000, buildFeed); return json(value, { origin, sMaxAge: 120, swr: 600, headers: { 'X-Cache': cache } }); }
  catch (_) { return json({ ok: false, source: 'error', asOf: new Date().toISOString(), profile: { name: 'Strategy Coin', handle: '@' + SCREEN, url: PROFILE_URL }, posts: [] }, { origin, sMaxAge: 30 }); }
}
