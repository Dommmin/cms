# FEATURE FLOW (AI DEVELOPMENT PIPELINE)

This defines how Cursor / Claude Code should work on any feature.

---

## STEP 1 — PLAN

Understand task and define:
- scope
- affected files
- risks

---

## STEP 2 — BUILD

Use Builder Agent prompt:
`.ai/prompts/builder.md`

Output implementation.

---

## STEP 3 — REVIEW

Use Reviewer Agent prompt:
`.ai/prompts/reviewer.md`

Analyze diff from builder.

---

## STEP 4 — DECISION

IF reviewer.score < 9 OR decision == REJECT:
send feedback back to builder
repeat STEP 2 (max 2 loops)

ELSE:
return final code

---

## STEP 5 — ESCALATION

If 2 loops fail:
- stop execution
- return full context to human

---

## RULE

Reviewer is mandatory before ANY final output.
No bypass allowed.
