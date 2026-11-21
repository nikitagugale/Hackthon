// Second-quarter rerun: made-up Q4 file (Oct-Dec 2026) with planted cases and decoys.
import test from "node:test"; import assert from "node:assert/strict";
import { runTests } from "../engine/rules.js"; import { groupEntries } from "../engine/rank.js"; import { CONFIG } from "../engine/rules.js";
import { load, norm } from "./helpers.js";
const rows = load("../data/journal-entries-q4.csv");
const cfg = { ...CONFIG, lockDates: { "2026-12": "2027-01-09" } };
const f = runTests(rows, cfg);
const EXPECTED = {
  "JE-2026-0231": ["T9"], "JE-2026-0233": ["T9"], "JE-2026-0248": ["T7"], "JE-2026-0249": ["T7"],
  "JE-2026-0262": ["T1"], "JE-2026-0278": ["T8"], "JE-2026-0283": ["T10"], "JE-2026-0290": ["T4", "X1"],
  "JE-2026-0294": ["T2"], "JE-2026-0308": ["T3"], "JE-2026-0309": ["T3"], "JE-2026-0312": ["T3"],
  "JE-2026-0315": ["T3"], "JE-2026-0321": ["T6"],
};
test("Q4: exact flag set with the December lock date supplied", () => assert.deepEqual(norm(f), EXPECTED));
test("Q4: Marlow split of 3 is one group; the lone Ostrand 460k is not in it", () => {
  const g = groupEntries(rows, f).find(x => x.kind === "split");
  assert.deepEqual([...g.ids].sort(), ["JE-2026-0308", "JE-2026-0312", "JE-2026-0315"]);
  assert.ok(!g.ids.includes("JE-2026-0309"));
});
test("Q4: entry keyed 8 Jan (before the 9 Jan lock) is not flagged", () => {
  const e = rows.find(r => r.entry_date === "2027-01-08"); assert.ok(e && !f[e.je_id]);
});
