// STRATEGY metrics: daily records, the fee-driven MSTR Yield, and placeholder history.
// Fee MSTR = MSTR in the pool above what the launch curve alone would hold at today's price
// (research/POOL-BACKING-MODEL.md). Demand-driven MSTR (the curve) is not counted as yield.
const day = d => d.toISOString().slice(0, 10);

/** One daily record from a /api/pool-backing `strategy` object. treasuryMstr stays null until a treasury wallet exists. */
export function record(s, date = new Date()) {
  return { d: day(date), poolMstr: s.stockInPool, curveMstr: s.curveStock, feeMstr: Math.max(0, s.stockInPool - s.curveStock), treasuryMstr: null, mcapUsd: s.mcapUsd, mstrUsd: s.stockUsd, supply: 1e9 };
}
export const holdings = r => r.poolMstr + (r.treasuryMstr || 0);
export const feeTotal = r => r.feeMstr + (r.treasuryMstr || 0);

/** MSTR Yield (fees) between two records: fee-driven MSTR added ÷ MSTR holdings at the start. */
export const mstrYield = (a, b) => a && b && holdings(a) > 0 ? (feeTotal(b) - feeTotal(a)) / holdings(a) * 100 : null;

/** Headline numbers from a sorted list of daily records (last = latest). */
export function summarize(days) {
  const L = days[days.length - 1]; if (!L) return null;
  const on = d => days.find(r => r.d >= d) || null;
  const t = new Date(L.d + 'T00:00:00Z'), y = t.getUTCFullYear(), q = Math.floor(t.getUTCMonth() / 3) * 3;
  const ago = new Date(t); ago.setUTCDate(ago.getUTCDate() - 30);
  const h = holdings(L);
  return { asOf: L.d, holdings: h, per1M: h / L.supply * 1e6, feeMstr: feeTotal(L), feePer1M: feeTotal(L) / L.supply * 1e6, treasuryMstr: L.treasuryMstr,
    mnav: L.mcapUsd && L.mstrUsd ? L.mcapUsd / (h * L.mstrUsd) : null,
    yield30d: mstrYield(on(day(ago)), L), yieldQtd: mstrYield(on(day(new Date(Date.UTC(y, q, 1)))), L), yieldYtd: mstrYield(on(`${y}-01-01`), L), ytdFrom: days[0].d > `${y}-01-01` ? days[0].d : null,
    series: days.map(r => ({ d: r.d, feePer1M: feeTotal(r) / r.supply * 1e6, per1M: holdings(r) / r.supply * 1e6 })) };
}

/** Placeholder history (SAMPLE) until the daily snapshot has run for a while. Deterministic, ends yesterday. */
export function sampleHistory(end = new Date(), start = '2026-09-09') {
  const out = [], s = new Date(start + 'T00:00:00Z'), e = new Date(day(end) + 'T00:00:00Z'); e.setUTCDate(e.getUTCDate() - 1);
  const n = Math.max(2, Math.round((e - s) / 864e5) + 1);
  for (let i = 0; i < n; i++) {
    const d = new Date(s); d.setUTCDate(d.getUTCDate() + i); const k = i / (n - 1);
    const mcap = 1.85e6 * (0.55 + 0.45 * k + 0.08 * Math.sin(i / 3.1)), mstrUsd = 143 + 6 * Math.sin(i / 7);
    const curve = 0.9935 * (Math.sqrt(mcap) - Math.sqrt(20265)) * 143 / mstrUsd, fee = 170 * Math.pow(k, 1.15) + 2 * Math.sin(i / 2.3) * k;
    out.push({ d: day(d), poolMstr: curve + Math.max(0, fee), curveMstr: curve, feeMstr: Math.max(0, fee), treasuryMstr: null, mcapUsd: mcap, mstrUsd, supply: 1e9, sample: true });
  }
  return out;
}
