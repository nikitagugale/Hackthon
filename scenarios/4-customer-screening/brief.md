# Scenario 4: Customer screening for a bank's financial crime team

## The situation

**Meridian Bank**'s financial crime team runs a periodic review of its customers against the sanctions and politically exposed person (PEP) lists. The current system compares names and produces **hundreds of alerts** for every real hit. Analysts spend most of their time closing false positives, and a real match can sit in the queue for days.

You have been asked to prototype a **screening assistant** that sorts a batch of customers against the lists, explains each decision, and puts the right cases in front of a person first.

## Why this is real

PwC's financial crime work includes AI that **prioritises high-risk alerts, cuts false positives and routes hits to a person for review** in sanctions, PEP and adverse media screening. The value is not in clearing alerts quickly: it is in clearing them **for the right reason** and showing that reason to a reviewer and a regulator.

## What you build

A **small web app** that screens the batch of customers in `customers.csv` against `watchlist.csv` and the adverse media, using the bank's own standard, and shows a **screening report** for the Financial Crime Officer. One page is enough, running on your laptop.

## What you have

- `customers.csv`: 30 customers, individuals and companies.
- `watchlist.csv`: 12 sanctions and PEP entries.
- `adverse-media.md`: eight news extracts.
- `screening-policy.md`: the bank's standard, with the match levels and the rules.

All names, companies, countries and events are invented for teaching. There is no real person or data in this pack.

## What the Financial Crime Officer needs

1. A decision for **every customer**: confirmed match, potential match, false positive, or no match, in the bank's own terms.
2. For each customer who is not "no match": the **evidence** (which fields matched, which did not), the **next action**, and who must do it.
3. A **queue** in priority order, with the cases that need action today at the top.
4. Linked adverse media, with how severe it is and **why it is or is not linked**.
5. A short note on **what the tool could not decide**.

The tool never clears a customer on its own, and it never takes an action on an account.

## Ideas worth trying

They are ideas, not requirements. The rubric on the cover pages shows how the room will judge.

- **Compare fields, not just names.** Date of birth, country and ownership are what separate a real match from a coincidence.
- **Let code do the exact checks** and let a model help with spelling variants and with reading the media text.
- **Treat the evidence as part of the answer.** A decision without its evidence is useless to a reviewer.
- **Write your own test cases:** one certain match, one certain non-match, and one where the data is missing.
- **Count what it costs** to screen 30 customers, and what it would cost for 3 million.
