import http from "node:http"; import { readFileSync } from "node:fs";
import { parseCSV } from "./engine/csv.js"; import { screen } from "./engine/screen.js";
const PORT = process.env.PORT || 3000, MAX = 5e6;
const REQUIRED = ["je_id", "posting_date", "entry_date", "period", "debit_account", "credit_account", "amount", "description", "prepared_by", "approved_by", "source"];
const page = () => readFileSync(new URL("./static/index.html", import.meta.url));
const sample = readFileSync(new URL("./data/journal-entries.csv", import.meta.url), "utf8");

function run(csv, q) {
  const rows = parseCSV(csv);
  if (!rows.length) throw new Error("The file has no rows.");
  const missing = REQUIRED.filter(c => !(c in rows[0]));
  if (missing.length) throw new Error("Missing columns: " + missing.join(", "));
  const bad = rows.filter(r => !/^\d{4}-\d{2}-\d{2}$/.test(r.posting_date) || !/^\d{4}-\d{2}-\d{2}$/.test(r.entry_date) || !Number.isFinite(Number(r.amount)));
  if (bad.length) throw new Error(`${bad.length} row(s) have an invalid date or amount, e.g. ${bad[0].je_id}. Nothing was screened.`);
  const lockDates = q.get("lockPeriod") && q.get("lockDate") ? { [q.get("lockPeriod")]: q.get("lockDate") } : undefined;
  return screen(rows, { lockDates });
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const send = (code, type, body) => { res.writeHead(code, { "Content-Type": type, "X-Content-Type-Options": "nosniff" }); res.end(body); };
  try {
    if (req.method === "GET" && url.pathname === "/") return send(200, "text/html; charset=utf-8", page());
    if (req.method === "GET" && url.pathname === "/api/sample") return send(200, "application/json", JSON.stringify(run(sample, url.searchParams)));
    if (req.method === "POST" && url.pathname === "/api/screen") {
      let b = "", n = 0;
      req.on("data", d => { n += d.length; if (n > MAX) { req.destroy(); } else b += d; });
      req.on("end", () => { try { send(200, "application/json", JSON.stringify(run(b, url.searchParams))); } catch (e) { send(400, "application/json", JSON.stringify({ error: e.message })); } });
      return;
    }
    send(404, "text/plain", "Not found");
  } catch (e) { send(400, "application/json", JSON.stringify({ error: e.message })); }
});
server.on("error", e => {
  if (e.code === "EADDRINUSE") { console.error(`Port ${PORT} is already in use (is the screener already running?). Try: PORT=3001 npm start`); process.exit(1); }
  throw e;
});
server.listen(PORT, "127.0.0.1", () => console.log(`Journal screener: http://localhost:${PORT}`));
