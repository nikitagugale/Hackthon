import { readFileSync } from "node:fs";
import { parseCSV } from "../engine/csv.js";
export const load = rel => parseCSV(readFileSync(new URL(rel, import.meta.url), "utf8"));
// compare helper: {id: Set} -> {id: sorted array}
export const norm = f => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, [...v].sort()]));
