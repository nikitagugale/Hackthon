import test from "node:test"; import assert from "node:assert/strict";
import { screen } from "../engine/screen.js"; import { load } from "./helpers.js";
const r = screen(load("../data/journal-entries.csv"));
test("top two are the multi-test revenue entries; split group is High", () => {
  assert.deepEqual(r.cards.slice(0, 2).map(c => c.members[0].entry.je_id).sort(), ["JE-2026-0170", "JE-2026-0176"]);
  assert.equal(r.cards.find(c => c.kind === "split").priority, "High");
});
test("every flagged entry appears exactly once", () => {
  const ids = r.cards.flatMap(c => c.members.map(m => m.entry.je_id)); assert.equal(ids.length, 11); assert.equal(new Set(ids).size, 11);
});
test("every test has evidence and a question", () => r.cards.forEach(c => c.members.forEach(m => m.tests.forEach(t => {
  assert.ok(Object.keys(t.evidence).length && t.question.includes(m.entry.je_id));
}))));
test("small flagged entries are listed, not hidden", () => assert.ok(r.cards.some(c => c.members.some(m => Number(m.entry.amount) < 225000))));
test("no 'fraud' or 'cleared' wording in questions", () => assert.ok(!/fraud|cleared as|error/i.test(JSON.stringify(r.cards.map(c => c.members.map(m => m.tests.map(t => t.question)))))));
test("not-tested statement present", () => assert.ok(r.notTested.length >= 5));
test("injection notice only on JE-0159", () => {
  const withNotice = r.cards.flatMap(c => c.members).filter(m => m.notice).map(m => m.entry.je_id);
  assert.deepEqual(withNotice, ["JE-2026-0159"]);
});
test("file line numbers match the CSV (header = line 1)", async () => {
  const { readFileSync } = await import("node:fs");
  const lines = readFileSync(new URL("../data/journal-entries.csv", import.meta.url), "utf8").split("\n");
  r.cards.flatMap(c => c.members).forEach(m => assert.ok(lines[m.line - 1].startsWith(m.entry.je_id), m.entry.je_id));
});
test("exact vs keyword kinds", () => {
  const kinds = Object.fromEntries(r.cards.flatMap(c => c.members).flatMap(m => m.tests).map(t => [t.id, t.kind]));
  assert.equal(kinds.T9, "keyword"); assert.equal(kinds.T10, "keyword"); assert.equal(kinds.T1, "exact");
});
test("start-here has 3 plain sentences and all checks pass", () => {
  assert.equal(r.startHere.length, 3); assert.ok(r.checks.every(c => c.ok));
});
test("each group has one question naming all its entries", () => {
  r.cards.filter(c => c.members.length > 1).forEach(c => c.members.forEach(m => assert.ok(c.question.includes(m.entry.je_id))));
});

// ---- gap fixes
import { CONFIG } from "../engine/rules.js";
const q4 = load("../data/journal-entries-q4.csv");
test("sample (Sept lock configured): no lock warning; injection listed once, flagged", () => {
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.injections.map(i => [i.je_id, i.flagged]), [["JE-2026-0159", true]]);
});
test("Q4 with default settings: warns that T6 was not run for 2026-12", () => {
  const x = screen(q4);
  assert.equal(x.warnings.length, 1); assert.match(x.warnings[0], /2026-12/); assert.match(x.warnings[0], /NOT run/);
  assert.match(x.notTested[0], /did not run for: .*2026-12/);
});
test("Q4 with December lock supplied: no warning, T6 found", () => {
  const x = screen(q4, { lockDates: { "2026-12": "2027-01-09" } });
  assert.deepEqual(x.warnings, []); assert.ok(x.cards.flatMap(c => c.members).some(m => m.tests.some(t => t.id === "T6")));
});
test("Q4: hostile text in an unflagged entry is still surfaced", () => {
  const x = screen(q4, { lockDates: { "2026-12": "2027-01-09" } });
  assert.deepEqual(x.injections.map(i => [i.je_id, i.flagged]), [["JE-2026-0285", false]]);
  assert.ok(!x.cards.flatMap(c => c.members).some(m => m.entry.je_id === "JE-2026-0285"));   // not ranked, not cleared: just listed
});
