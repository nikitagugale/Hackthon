// Minimal RFC-4180 CSV parser (handles quoted fields, escaped quotes, CRLF, BOM).
export function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const rows = [], starts = []; let row = [], f = "", q = false, ln = 1, start = 1, fresh = true;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (fresh && c !== "\n" && c !== "\r") { start = ln; fresh = false; }
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
      if (c === "\n") ln++;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      ln++; row.push(f); f = ""; if (row.some(x => x !== "")) { rows.push(row); starts.push(start); } row = []; fresh = true;
    } else f += c;
  }
  if (f !== "" || row.length) { row.push(f); if (row.some(x => x !== "")) { rows.push(row); starts.push(start); } }
  const [head, ...body] = rows;
  return body.map((r, k) => ({ ...Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])), _line: starts[k + 1] }));
}
