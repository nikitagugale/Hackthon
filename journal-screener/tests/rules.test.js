// Test cases written BEFORE the rules (Phase 1).
import test from "node:test"; import assert from "node:assert/strict";
import { runTests } from "../engine/rules.js"; import { groupEntries } from "../engine/rank.js";
import { load, norm } from "./helpers.js";

const syn = load("./synthetic.csv"), sf = runTests(syn), sg = groupEntries(syn, sf);
const fl = i => [...(sf[i] ?? [])].sort();
const has = (i, t) => (sf[i] ?? new Set()).has(t);
const sameSet = (g, ids) => g.ids.length === ids.length && ids.every(i => g.ids.includes(i));

test("clean entry has no flags", () => assert.deepEqual(fl("S-CLEAN"), []));
test("bad entry fails several tests", () => assert.deepEqual(fl("S-BAD"), ["T1", "T2", "T4", "T5", "T9"]));
test("round-sum / approval boundary", () => {
  assert.ok(has("S-EXACT500K", "T2")); assert.ok(!has("S-EXACT500K", "T5"));
  assert.ok(!has("S-500001", "T2")); assert.ok(has("S-500001", "T5"));
});
test("just-under band 450,000-499,999", () => {
  assert.ok(has("S-499999", "T3")); assert.ok(has("S-450000", "T3")); assert.ok(!has("S-449999", "T3"));
});
test("SYSTEM entries are out of scope", () => assert.deepEqual(fl("S-SYS-WEEKEND"), []));
test("closed period", () => {
  assert.ok(!has("S-LOCK-9OCT", "T6")); assert.ok(has("S-LOCK-10OCT", "T6")); assert.ok(!has("S-AUG-LATE-KEY", "T6"));
});
test("split grouped by preparer+supplier, others not", () => {
  assert.ok(sg.some(g => sameSet(g, ["S-SPLIT-1", "S-SPLIT-2", "S-SPLIT-3"])));
  assert.ok(!sg.some(g => g.ids.some(i => i.startsWith("S-NOSPLIT"))));
});
test("duplicate pair flagged and grouped", () => {
  assert.ok(has("S-DUP-1", "T7") && has("S-DUP-2", "T7"));
  assert.ok(sg.some(g => sameSet(g, ["S-DUP-1", "S-DUP-2"])));
});
test("suspense", () => assert.ok(has("S-SUSPENSE", "T8")));
test("injected instruction is ignored, entry still flagged", () => assert.deepEqual(fl("S-INJECT"), ["T10", "T2"]));
test("approval level", () => { assert.ok(has("S-NEEDS-CS", "T5")); assert.ok(!has("S-OK-CS", "T5")); });

test("X1: entry <= 500,000 approved by someone outside the approval matrix", () => {
  assert.deepEqual(fl("S-ACCT-APPROVER"), ["X1"]); assert.deepEqual(fl("S-UNKNOWN-APPROVER"), ["X1"]);
  assert.deepEqual(fl("S-CS-LOW"), []);                       // Controller approving a smaller entry: higher authority, accepted
  assert.deepEqual(fl("S-ACCT-ON-LARGE"), ["T5"]);            // > 500,000 is already T5: no double count
  assert.ok(!has("S-CLEAN", "X1") && !has("S-EXACT500K", "X1"));
});

// Real extract: expected result derived by hand in Phase 0. Every other entry must have NO flags.
const EXPECTED = {
  "JE-2026-0086": ["T7"], "JE-2026-0087": ["T7"], "JE-2026-0102": ["T8"],
  "JE-2026-0136": ["T3"], "JE-2026-0140": ["T3"], "JE-2026-0149": ["T3"], "JE-2026-0153": ["T3"],
  "JE-2026-0159": ["T10", "T2"], "JE-2026-0170": ["T1", "T2", "T9"],
  "JE-2026-0176": ["T4", "T5", "T9"], "JE-2026-0180": ["T6"],
};
const real = load("../data/journal-entries.csv"), rf = runTests(real);
test("real extract: exact flag set", () => assert.deepEqual(norm(rf), EXPECTED));
test("real extract: Zenith split is one group", () =>
  assert.ok(groupEntries(real, rf).some(g => sameSet(g, ["JE-2026-0136", "JE-2026-0140", "JE-2026-0149", "JE-2026-0153"]))));
test("month-end late keying not flagged", () =>
  ["0056", "0103", "0105", "0106", "0107"].forEach(n => assert.ok(!rf["JE-2026-" + n])));
