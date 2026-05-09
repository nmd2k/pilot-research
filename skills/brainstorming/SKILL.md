---
name: brainstorming
description: "Use when researcher wants to discuss a research idea, explore a hypothesis, design an experiment, or refine an existing research plan"
---

# Brainstorming

This skill guides structured ideation, research planning, and experiment design through Socratic dialogue with the researcher.

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Read the latest backlog from `.research/plans/v<N>-backlog.md` (if any)
- [ ] Review relevant wiki pages referenced in existing plans

## Three Cases

Determine which case applies based on the current state:

### Case 1: New Research Plan

**Trigger:** No existing plan found in `.research/plans/`, or researcher explicitly wants to start fresh.

Focus on:
- What is the research question?
- What is the hypothesis?
- Why does this matter? What gap does it address?
- What is the high-level methodology?

<EXTREMELY-IMPORTANT>Do not skip the motivation. A plan without clear motivation will produce unfocused experiments.</EXTREMELY-IMPORTANT>

### Case 2: Experiment Design

**Trigger:** Existing plan found, researcher wants to design specific experiments.

Focus on:
- What methodology will we use?
- What are the independent, dependent, and controlled variables?
- What are the controls and baselines?
- What are the success criteria?
- What are the risks and mitigations?

<EXTREMELY-IMPORTANT>Every experiment must link back to the research hypothesis. If you cannot map an experiment to a hypothesis, question whether it is needed.</EXTREMELY-IMPORTANT>

### Case 3: Update Existing Plan

**Trigger:** Existing plan found, researcher wants to modify it (change hypothesis, adjust methodology, add scope, etc.).

Focus on:
- What specifically changed?
- Why did it change?
- What is the impact on the existing backlog?
- Which tasks need to be added, removed, or modified?

<EXTREMELY-IMPORTANT>When updating a plan, always create a new version (`v<N+1>.md`). Never overwrite an existing plan. Update the backlog to match.</EXTREMELY-IMPORTANT>

## Process Flow

### Step 1: Read Context

Read all relevant existing artifacts:
- Latest plan from `.research/plans/`
- Latest backlog from `.research/plans/v<N>-backlog.md`
- Relevant `[[paper-<slug>]]`, `[[concept-<name>]]`, `[[entity-<name>]]` pages
- Any `[[handoff-<YYYY-MM-DD>]]` reports

### Step 2: Clarify

Ask the researcher about:
- [ ] Their goals and what they want to achieve
- [ ] Any constraints (time, resources, data availability)
- [ ] Ambiguous points in their request
- [ ] Whether this is Case 1, 2, or 3

### Step 3: Discuss

Engage in Socratic dialogue:
- Propose ideas and ask "what if?"
- Challenge assumptions
- Suggest alternatives and trade-offs
- Connect to existing literature via `[[wikilinks]]`
- Identify gaps in reasoning

<EXTREMELY-IMPORTANT>Do not just agree with the researcher. Your job is to stress-test ideas, expose flaws, and improve the research plan through constructive critique.</EXTREMELY-IMPORTANT>

### Step 4: Produce/Update Plan

Write or update the research plan using `research-plan-template.md`:
- [ ] Research question is clearly stated
- [ ] Hypothesis is testable and specific
- [ ] Motivation explains the gap and significance
- [ ] Methodology outlines the approach
- [ ] Key literature is linked via `[[wikilinks]]`
- [ ] Experiment design outlines are included
- [ ] Backlog link is present

Save to `.research/plans/v<N>.md`

### Step 5: Produce/Update Backlog

Write or update the backlog using `backlog-template.md`:
- [ ] Each task has a unique ID (T1, T2, T3...)
- [ ] Each task has a clear description
- [ ] Dependencies between tasks are specified
- [ ] Assignee is noted (human or agent)
- [ ] Relevant wiki links are included

Save to `.research/plans/v<N>-backlog.md`

### Step 6: Save to Wiki

- [ ] Plan saved to `.research/plans/v<N>.md`
- [ ] Backlog saved to `.research/plans/v<N>-backlog.md`
- [ ] All `[[wikilinks]]` are correct and point to existing wiki pages
- [ ] Existing entity/concept pages updated if the plan introduces new connections

## Red Flags

Stop and address these before proceeding:

| Red Flag | Why It Matters |
|----------|---------------|
| No clear research question | The plan will produce unfocused work |
| Vague hypothesis ("we'll see what happens") | Impossible to evaluate success or failure |
| No motivation beyond "it's interesting" | Research lacks significance and impact |
| Experiments not linked to hypothesis | Effort may be wasted on tangential work |
| Backlog tasks with no dependencies listed | Execution order is ambiguous |
| Researcher can't articulate why it matters | The plan needs more thought before proceeding |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "We'll figure out the hypothesis later" | No hypothesis = no way to evaluate results. Define it now. |
| "The methodology is obvious" | If you can't write it down, it's not defined enough. |
| "We don't need a backlog yet" | Without tasks, nothing gets executed. Create the backlog. |
| "We can skip the literature review" | Without literature context, you may duplicate work or miss key insights. |

## Transitioning to Other Skills

After completing brainstorming:
- If the researcher needs supporting papers → invoke `pilot-research:literature-review`
- If the researcher is ready to execute tasks → invoke `pilot-research:execute-research`
- If the researcher wants feedback on the plan → invoke `pilot-research:peer-review`

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YYYY-MM-DD.md` before ending the session or transitioning to another skill.</EXTREMELY-IMPORTANT>

## Templates

- `research-plan-template.md` — For creating research plans
- `backlog-template.md` — For creating task backlogs