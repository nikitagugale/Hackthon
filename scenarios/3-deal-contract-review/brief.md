# Scenario 3: Contract red flags for a deal team

## The situation

**Project Kestrel.** Your client, **Corvane Holdings**, is buying **Brightwater Logistics**, a freight and warehousing business. The deal team has been given a data room with four key contracts. The investment committee meets on Monday, and the deal lead needs the **red flags that could change the price or the deal terms**.

Brightwater's largest customer, **Aurelia Retail**, is about **38% of its revenue**. Corvane already serves **Northgate Foods**, a direct competitor of Aurelia.

Two associates read the contracts and write a summary by hand. In a bigger deal there would be 10,000 of them.

## Why this is real

PwC deals teams have described using AI to review large sets of contracts, for example to find **termination clauses across thousands of contracts** in an acquisition. In this work the cost of a miss is high, and so is the cost of a confident invented clause.

## What you build

A **small web app** that reads the four contracts and shows a **red-flag register** for the deal lead, with the exact clause for every flag. One page is enough, running on your laptop.

## What you have

- `deal-brief.md`: what the buyer cares about, the dates, and the severity scale.
- `contracts/`: four contract extracts (a customer, a second customer, a supplier and a warehouse lease).

All names, companies and terms are invented for teaching. There is no client data in this pack.

## What the deal lead needs

1. A register of red flags: contract, **clause number**, a **short quote**, why it matters to this buyer, and a **severity** (high, medium, low).
2. For each topic on the buyer's list, a clear **"not found in this contract"** when that is the case. Absence matters in diligence.
3. Anything that **contradicts itself** or depends on a date, shown with the calculation.
4. A short list of questions for the seller's lawyers.

The tool does not give legal advice. A lawyer reads every flag before it goes to the client.

## Ideas worth trying

They are ideas, not requirements. The rubric on the cover pages shows how the room will judge.

- **Extract in a fixed shape** (clause, quote, topic) before you judge anything.
- **Quote the clause** so a lawyer can check it in ten seconds.
- **Do the date arithmetic in code,** not in the model.
- **Keep "absent" and "present but unclear" apart.**
- **Write your own test cases:** a clause you know is there, one that is not, and one that is hidden in a schedule.
- **Count what it costs** for four contracts, and then for 10,000.
