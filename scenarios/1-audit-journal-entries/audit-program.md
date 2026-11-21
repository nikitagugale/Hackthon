# Journal entry testing programme: Halvorsen Industrial Group, FY2026 interim

Engagement: statutory audit, interim procedures for the quarter 1 July to 30 September 2026.
Prepared for the audit senior. Version 2.0.

## Population and scope

- The extract holds every journal entry posted in the quarter: **180 entries**.
- Entries with source **MANUAL** are in scope for the tests below.
- Entries with source **SYSTEM** are posted by automated interfaces. They are covered by the IT general controls work and are **out of scope** here, but they stay in the extract so you can see the whole ledger.
- Dates are in `YYYY-MM-DD`. `posting_date` is the date the entry is dated. `entry_date` is the date it was keyed in.
- The **period lock date** for September was **9 October 2026**. After that date no entry should be keyed into the September period.
- Company holidays in the quarter: none on a weekday. 15 August 2026 fell on a Saturday.

## The tests

| Test | What to look for |
|---|---|
| T1 Weekend posting | A manual entry dated on a Saturday or a Sunday |
| T2 Round sum | A manual entry of 500,000 or more that is an exact multiple of 100,000 |
| T3 Just under the limit | A manual entry of 450,000 to 499,999, below the 500,000 approval limit. Then look for **splitting**: several such entries by the same preparer, for the same supplier or purpose, in a short window |
| T4 Self-approval | The preparer and the approver are the same person |
| T5 Approval level | A manual entry above 500,000 that the Controller has not approved (see `approval-matrix.md`) |
| T6 Closed period | An entry keyed in after the period lock date but dated inside the locked period |
| T7 Possible duplicate | Two entries with the same accounts, amount, posting date and description |
| T8 Suspense | Any posting to or from the suspense account 1999 |
| T9 Vague reason | A description that gives a reason rather than a fact, such as "adjustment", "per CFO", "as discussed", "true-up", "plug", "misc" |
| T10 Related party | A description that points to a loan, a director or a related party |

## Ranking guidance

Rank higher when:

- the entry fails **more than one** test;
- it touches **revenue** (account 4000) or happens in the **last week of the quarter**;
- it is above the **clearly trivial threshold of 225,000**;
- it forms a **pattern** with other entries (a split, a pair).

Do **not** hide small entries that fail a test. List them lower, with the reason.

## What the working paper must say

- For each flagged entry: the test or tests, the evidence (entry id and fields), and a **neutral follow-up question** for the client. Write "requires follow-up", never "fraud" or "error".
- A person decides whether an entry is acceptable. The tool never marks an entry as cleared.
- A short list of what was **not** tested.
