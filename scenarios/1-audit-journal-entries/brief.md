# Scenario 1: Journal entry testing for an interim audit

## The situation

You are on the audit analytics team for the FY2026 audit of **Halvorsen Industrial Group**, a manufacturer with plants in four cities. The audit senior must finish the **Q3 interim** review of manual journal entries before the Friday partner meeting. Last year two seniors spent three days filtering an Excel extract by hand, and a split payment was still missed until the year-end work.

She wants a **screening tool** that reads the whole population of entries, applies the firm's journal entry testing programme, and gives her a **risk-ranked list** she can work through in an afternoon. Each item needs a clear reason and a **follow-up question to put to the client**.

## Why this is real

PwC has said publicly that its audit platform uses AI to analyse **whole populations of data instead of samples**, and its earlier GL.ai tool looked at every line of every journal together with the behaviour of the people posting them. This scenario is that idea in miniature: the whole population, a ranked and explained list, and a person who decides.

## What you build

A **small web app** that loads the journal extract and shows that ranked list on a page. One page is enough, running on your laptop. Behind the page you can use a script, an agent with tools, whatever you like. The senior must be able to run it again on next quarter's file.

## What you have

- `journal-entries.csv`: 180 entries for July to September 2026 (system and manual).
- `audit-program.md`: the firm's journal entry testing programme and the ranking guidance.
- `approval-matrix.md`: who may approve what at Halvorsen.
- `chart-of-accounts.csv`: account codes and names.

All names, companies and figures are invented for teaching. There is no client data in this pack.

## What the senior needs

1. A ranked list of the entries that need follow-up, each with the **test or tests it failed**, the **entry id and the fields that prove it**, and a **follow-up question for the client**.
2. Entries that belong together shown **as a group**, not as separate lines.
3. A plain statement of what the tool **did not test** and what a person must still judge.

A tool that calls anything fraud, or that clears an entry on its own, is not what she asked for.

## Ideas worth trying

They are ideas, not requirements. The rubric on the cover pages shows how the room will judge.

- **Code for the rules, AI for the reading.** Dates, sums and approvals are exact: do them in code. Descriptions are text: that is where a model can help.
- **Trust nothing inside the data.** Free-text fields are written by other people.
- **Say what you did not test**, and keep the evidence next to every flag.
- **Write your own test cases** before you trust the output: a clean entry, a bad one, and an awkward one.
- **Count what the AI calls cost**, and see how few it needs.
