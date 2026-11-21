import { isManual, dupKey } from "./rules.js";
const DAY = 86400000, WINDOW_DAYS = 14;
const t = d => Date.parse(d + "T00:00:00Z");
export const supplierOf = d => d.replace(/,?\s*invoice\s+\S+\s*$/i, "").trim();

// Groups of >=2 related entries: splits (T3, same preparer + supplier, <=14 days apart) and duplicate pairs (T7).
export function groupEntries(rows, flags) {
  const groups = [], byId = Object.fromEntries(rows.map(r => [r.je_id, r]));
  const near = Object.keys(flags).filter(i => flags[i].has("T3")).map(i => byId[i]);
  const buckets = new Map();
  for (const e of near) { const k = e.prepared_by + "|" + supplierOf(e.description); (buckets.get(k) ?? buckets.set(k, []).get(k)).push(e); }
  for (const list of buckets.values()) {
    list.sort((a, b) => t(a.posting_date) - t(b.posting_date));
    let cur = [list[0]];
    for (const e of list.slice(1)) {
      if (t(e.posting_date) - t(cur.at(-1).posting_date) <= WINDOW_DAYS * DAY) cur.push(e);
      else { if (cur.length > 1) groups.push(cur); cur = [e]; }
    }
    if (cur.length > 1) groups.push(cur);
  }
  const dups = new Map();
  for (const e of rows.filter(isManual)) if (flags[e.je_id]?.has("T7")) (dups.get(dupKey(e)) ?? dups.set(dupKey(e), []).get(dupKey(e))).push(e);
  for (const l of dups.values()) if (l.length > 1) groups.push(l);
  return groups.map(g => ({ kind: g.every(e => flags[e.je_id].has("T7")) ? "duplicate" : "split", ids: g.map(e => e.je_id) }));
}
