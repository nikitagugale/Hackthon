// Orchestrates tests -> evidence -> ranking -> grouping -> follow-up questions.
import { runTests, TESTS, CONFIG, isManual, INJECTION, KIND } from "./rules.js";
import { groupEntries } from "./rank.js";

const WEIGHT = { T1: 2, T2: 2, T3: 2, T4: 4, T5: 4, T6: 3, T7: 2, T8: 2, T9: 1, T10: 3, X1: 3 };
const fmt = n => Number(n).toLocaleString("en-US");
const FIELDS = {
  T1: ["posting_date"], T2: ["amount"], T3: ["amount"], T4: ["prepared_by", "approved_by"],
  T5: ["amount", "approved_by"], T6: ["period", "posting_date", "entry_date"], T7: ["debit_account", "credit_account", "amount", "posting_date", "description"],
  T8: ["debit_account", "credit_account"], T9: ["description"], T10: ["description"], X1: ["amount", "approved_by"],
};
const QUESTION = {
  T1: e => `Entry ${e.je_id} is dated ${e.posting_date}, a weekend. Who posted it on that date, and why was it not posted on a working day?`,
  T2: e => `Entry ${e.je_id} is for exactly ${fmt(e.amount)}. How was this amount determined, and what supporting calculation or document exists?`,
  T3: e => `Entry ${e.je_id} (${fmt(e.amount)}) is just below the ${fmt(CONFIG.approvalLimit)} approval limit. What is the business purpose, and was it considered together with related invoices?`,
  T4: e => `${e.prepared_by} is recorded as both preparer and approver of ${e.je_id}. Who independently reviewed this entry?`,
  T5: e => `Entry ${e.je_id} for ${fmt(e.amount)} is above ${fmt(CONFIG.approvalLimit)} but approved by ${e.approved_by}, not the Controller. Is there Controller approval or a documented delegation?`,
  T6: e => `Entry ${e.je_id} is dated ${e.posting_date} (period ${e.period}) but was keyed in on ${e.entry_date}, after the period lock. Who authorised posting into the locked period, and why?`,
  T7: e => `Entry ${e.je_id} has the same accounts, amount, date and description as another entry. Are both valid, or was one posted twice?`,
  T8: e => `Entry ${e.je_id} involves suspense account ${CONFIG.suspense}. What is the underlying item, and when will it be cleared to its final account?`,
  T9: e => `The description of ${e.je_id} ("${e.description.slice(0, 80)}") gives a reason rather than a fact. What is the underlying transaction and supporting evidence?`,
  X1: e => `${e.approved_by} approved ${e.je_id} (${fmt(e.amount)}), but the approval matrix names the Finance Manager (${CONFIG.authorisedApprovers[0]}) for entries up to ${fmt(CONFIG.approvalLimit)}. Is there a documented delegation for ${e.approved_by}?`,
  T10: e => `The description of ${e.je_id} refers to a loan, director or related party. Who is the counterparty, and were the terms and approval documented per related-party policy?`,
};
export const NOT_TESTED = [
  "Approvers are checked only against the names in the approval matrix (check X1). A delegation that is not written there would be flagged; a person must confirm it.",
  "SYSTEM / interface entries (covered by IT general controls work, out of scope here).",
  "Whether any description is true: the tool reads text only; it does not see supporting documents.",
  "Business purpose, intent and management override: a person must judge these.",
  "Duplicates with different wording, and splits across different preparers or suppliers.",
  "Entries outside the quarter in the file, and any entry the file does not contain (completeness of the extract).",
  "An entry with no flag is NOT cleared. It only means none of the ten tests fired.",
];

const endOfMonth = d => { const [y, m] = d.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); };

export function screen(rows, opts = {}) {
  const cfg = { ...CONFIG, lockDates: opts.lockDates ?? CONFIG.lockDates };
  const flags = runTests(rows, cfg), byId = Object.fromEntries(rows.map(r => [r.je_id, r]));
  const manual = rows.filter(isManual);
  const quarterEnd = endOfMonth(rows.map(r => r.posting_date).sort().at(-1));
  const lastWeek = new Date(Date.parse(quarterEnd) - 6 * 86400000).toISOString().slice(0, 10);
  const groups = groupEntries(rows, flags);
  const inGroup = new Map(); groups.forEach((g, i) => g.ids.forEach(id => inGroup.set(id, i)));

  const item = e => {
    const tests = [...flags[e.je_id]].sort((a, b) => (a[0] === "X") - (b[0] === "X") || Number(a.slice(1)) - Number(b.slice(1)));
    const reasons = []; let score = 0;
    for (const t of tests) { score += WEIGHT[t]; reasons.push([`${t} ${TESTS[t]}`, WEIGHT[t]]); }
    const add = (why, n) => { score += n; reasons.push([why, n]); };
    if (tests.length > 1) add(`Fails ${tests.length} tests`, 2 * (tests.length - 1));
    if (e.debit_account === "4000" || e.credit_account === "4000") add("Touches revenue (4000)", 2);
    if (e.posting_date >= lastWeek) add("Last week of the quarter", 2);
    if (Number(e.amount) > 225000) add("Above clearly trivial threshold (225,000)", 2);
    if (inGroup.has(e.je_id)) add("Part of a pattern (group)", 2);
    const notice = INJECTION.test(e.description) ? "This description contains an instruction aimed at the reviewer. It was treated as data and ignored: the entry was tested like every other." : null;
    return { entry: e, notice, line: e._line, tests: tests.map(t => ({ id: t, name: TESTS[t], kind: KIND[t] ?? "exact", evidence: Object.fromEntries(FIELDS[t].map(f => [f, e[f]])), question: QUESTION[t](e) })), score, reasons };
  };
  const cards = [];
  groups.forEach((g, i) => {
    const members = g.ids.map(id => item(byId[id]));
    const label = g.kind === "split"
      ? `Possible split: ${g.ids.length} entries by ${members[0].entry.prepared_by}, total ${fmt(members.reduce((s, m) => s + Number(m.entry.amount), 0))}, each just under the ${fmt(CONFIG.approvalLimit)} limit`
      : `Possible duplicate pair: ${g.ids.length} entries identical in accounts, amount, date and description`;
    const total = members.reduce((s, m) => s + Number(m.entry.amount), 0);
    const bonus = g.kind === "split" && total > CONFIG.approvalLimit ? 6 : 2;   // combined amount would have needed Controller approval
    const ids = members.map(m => m.entry.je_id), dates = members.map(m => m.entry.posting_date).sort();
    const question = g.kind === "split"
      ? `Entries ${ids.join(", ")} (total ${fmt(total)}) were posted by ${members[0].entry.prepared_by} between ${dates[0]} and ${dates.at(-1)}, each just below the ${fmt(CONFIG.approvalLimit)} approval limit. What is the business purpose, and were they considered together for approval?`
      : `Entries ${ids.join(" and ")} have the same accounts, amount, date and description. Are both valid, or was one posted twice?`;
    cards.push({ kind: g.kind, title: label, question, total, score: Math.max(...members.map(m => m.score)) + bonus, bonus: bonus === 6 ? "Combined amount exceeds the approval limit" : "Pattern", members });
  });
  for (const id of Object.keys(flags)) if (!inGroup.has(id)) { const m = item(byId[id]); cards.push({ kind: "single", title: `${id}: ${m.entry.description.slice(0, 90)}`, score: m.score, members: [m] }); }
  cards.sort((a, b) => b.score - a.score);
  cards.forEach((c, i) => { c.rank = i + 1; c.priority = c.score >= 12 ? "High" : c.score >= 6 ? "Medium" : "Lower"; });
  const PHRASE = { T1: "was posted on a weekend", T2: "is a round sum", T3: "sits just under the approval limit", T4: "was prepared and approved by the same person", T5: "lacks Controller approval above the limit", T6: "was keyed in after the period lock", T7: "looks like a duplicate", T8: "touches the suspense account", T9: "has a vague reason instead of a fact", T10: "mentions a loan, director or related party", X1: "was approved by someone not named in the approval matrix" };
  const startHere = cards.slice(0, 3).map(c => c.members.length > 1 ? `${c.title}.` :
    `${c.members[0].entry.je_id} (${fmt(c.members[0].entry.amount)}) ${c.members[0].tests.map(x => PHRASE[x.id]).join(", ")}.`);
  const flaggedIds = Object.keys(flags), ids = new Set(rows.map(r => r.je_id));
  const shown = cards.flatMap(c => c.members.map(m => m.entry.je_id));
  const checks = [
    { label: `${manual.length} manual + ${rows.length - manual.length} SYSTEM = ${rows.length} entries in the file`, ok: manual.length + (rows.length - manual.length) === rows.length && new Set(rows.map(r => r.je_id)).size === rows.length },
    { label: "Every flagged entry exists in the file", ok: flaggedIds.every(i => ids.has(i)) },
    { label: `Every flagged entry is shown exactly once (${flaggedIds.length} flagged, ${shown.length} shown)`, ok: shown.length === flaggedIds.length && new Set(shown).size === shown.length },
    { label: "No SYSTEM entry was tested", ok: flaggedIds.every(i => rows.find(r => r.je_id === i).source === "MANUAL") },
  ];
  // Gap fixes: (1) never silently skip T6; (2) surface hostile text even when the entry fails no test.
  const periods = [...new Set(manual.map(r => r.period))].sort(), latest = periods.at(-1);
  const covered = periods.filter(pd => cfg.lockDates[pd]), uncovered = periods.filter(pd => !cfg.lockDates[pd]);
  const warnings = [];
  if (latest && !cfg.lockDates[latest]) warnings.push(`No period lock date is set for ${latest}, the latest period in this file, so T6 (closed period) was NOT run for it. Enter the locked period and lock date above and screen again.`);
  const injections = rows.filter(r => INJECTION.test(r.description)).map(r => ({ je_id: r.je_id, line: r._line, source: r.source, description: r.description, flagged: Boolean(flags[r.je_id]) }));
  const lockNote = `T6 (closed period) ran only for periods with a lock date: ${covered.join(", ") || "none"}. It did not run for: ${uncovered.join(", ") || "none"}.`;
  return {
    startHere, checks, warnings, injections, summary: { total: rows.length, manualTested: manual.length, systemSkipped: rows.length - manual.length, entriesFlagged: Object.keys(flags).length, cards: cards.length, quarterEnd, lockDates: cfg.lockDates },
    cards, notTested: [lockNote, ...NOT_TESTED],
  };
}
