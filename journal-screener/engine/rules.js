// Exact tests T1-T10 from audit-program.md. Descriptions are treated purely as DATA (never as instructions).
export const CONFIG = {
  lockDates: { "2026-09": "2026-10-09" },   // period -> last day entries may be keyed in
  approvalLimit: 500000, controller: "c.sharma", authorisedApprovers: ["m.rao", "c.sharma"],  // per approval-matrix.md; the Controller is accepted as a higher authority for smaller entries
  suspense: "1999",
  justUnder: [450000, 499999], roundStep: 100000,
};
export const TESTS = {
  T1: "Weekend posting", T2: "Round sum", T3: "Just under approval limit", T4: "Self-approval",
  T5: "Approval level", T6: "Closed period", T7: "Possible duplicate", T8: "Suspense account",
  T9: "Vague reason", T10: "Related party",
  X1: "Approver not in approval matrix",   // extra check from approval-matrix.md, not one of the programme's T1-T10
};
export const VAGUE = /\b(adjust(ment|ments)?|per (the )?(cfo|ceo|management|director)|as discussed|true[- ]?up|plug|misc(ellaneous)?|as agreed|one[- ]off)\b/i;
export const RELATED = /\b(loan|director|related[- ]part(y|ies)|shareholder|promoter)\b/i;

const num = e => Number(e.amount);
export const isManual = e => e.source === "MANUAL";
const dow = d => new Date(d + "T00:00:00Z").getUTCDay();
export const dupKey = e => [e.debit_account, e.credit_account, e.amount, e.posting_date, e.description].join("|");

// returns { je_id: Set(tests) } for entries with >=1 flag. SYSTEM entries are out of scope.
export function runTests(rows, cfg = CONFIG) {
  const manual = rows.filter(isManual), out = {};
  const add = (e, t) => (out[e.je_id] ??= new Set()).add(t);
  const dups = new Map();
  for (const e of manual) dups.set(dupKey(e), (dups.get(dupKey(e)) ?? 0) + 1);
  for (const e of manual) {
    const a = num(e);
    if ([0, 6].includes(dow(e.posting_date))) add(e, "T1");
    if (a >= cfg.approvalLimit && a % cfg.roundStep === 0) add(e, "T2");
    if (a >= cfg.justUnder[0] && a <= cfg.justUnder[1]) add(e, "T3");
    if (e.prepared_by === e.approved_by) add(e, "T4");
    if (a <= cfg.approvalLimit && !cfg.authorisedApprovers.includes(e.approved_by)) add(e, "X1");   // > limit is covered by T5
    if (a > cfg.approvalLimit && e.approved_by !== cfg.controller) add(e, "T5");
    const lock = cfg.lockDates[e.period];
    if (lock && e.entry_date > lock) add(e, "T6");
    if (dups.get(dupKey(e)) > 1) add(e, "T7");
    if (e.debit_account === cfg.suspense || e.credit_account === cfg.suspense) add(e, "T8");
    if (VAGUE.test(e.description)) add(e, "T9");
    if (RELATED.test(e.description)) add(e, "T10");
  }
  return out;
}

// Text in a description that tries to give the reviewer/tool orders. Reported as a notice; NEVER obeyed.
export const INJECTION = /(note to (the )?(reviewer|auditor|tool)|ignore (all|any|previous|the|these)|exclude (this |it )?from (testing|review)|(mark|treat|set)( it| this)? as (cleared|reviewed|ok|approved)|pre-?approved by|do not (flag|test|report)|disregard|system prompt|as an ai)/i;
export const KIND = { T9: "keyword", T10: "keyword" };   // everything else is an exact rule
