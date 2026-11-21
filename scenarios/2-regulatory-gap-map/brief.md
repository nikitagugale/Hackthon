# Scenario 2: From regulatory circular to gap map

## The situation

The **Federal Banking Authority** has issued **Circular 2026/14** on outsourcing and third-party risk. **Meridian Bank** must send the Authority a gap assessment and an action plan by 31 March 2027. The Chief Compliance Officer has asked your team for a first view before the board risk committee on 4 December.

Today three analysts read the circular line by line and compare it to the bank's policies in a spreadsheet. It takes about a week and each analyst reads the policies a little differently.

## Why this is real

PwC teams have described tools that watch regulatory changes and **map them to a client's internal policies and controls to find the gaps**. PwC Singapore reports cutting a mapping job from days to hours, and PwC Australia launched a generative AI product for the same purpose. The hard part is not the reading: it is being right about what is covered and what is not.

## What you build

A **small web app** that reads the circular and the policy library and shows a **gap map** the Chief Compliance Officer can take to the committee, plus a one-page summary she can read in two minutes. One page is enough, running on your laptop.

## What you have

- `circular-fba-2026-14.md`: the circular (14 numbered paragraphs).
- `policy-library/`: Meridian Bank's policy documents, with their version and status.

All names, companies and rules are invented for teaching. There is no client data in this pack.

## What the Chief Compliance Officer needs

1. For **each requirement**: a status (covered, partly covered, not covered, conflicting, or needs a legal reading), the **policy section that is the evidence**, a suggested **action**, an owner by role, and the **date it applies from**.
2. A **short summary**: what is solid, what is not, and the three things she must act on first.
3. A clear line between **what the text says** and **what the tool is guessing**.

Nothing in a policy may be changed by the tool, and it never states that the bank "complies". It says what the documents support.

## Ideas worth trying

They are ideas, not requirements. The rubric on the cover pages shows how the room will judge.

- **Find the right text first.** Match each requirement to candidate policy sections, then judge, instead of giving a model everything at once.
- **Quote, do not paraphrase,** in the evidence column.
- **Check the status of every document** before you rely on it.
- **Say "not covered" and "needs a lawyer"** when that is the truth. A confident wrong answer in a compliance report is worse than a gap.
- **Write your own test cases:** a requirement you know is covered, one you know is not, and one that is vague.
- **Count what it costs** to run on one circular, and how the cost grows with ten.
