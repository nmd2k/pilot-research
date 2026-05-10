---
name: pilot-brainstorm
description: "Use when researcher wants to discuss a research idea, explore a hypothesis, design an experiment, or refine an existing research plan"
---

# Brainstorming

This skill guides structured ideation, research planning, and experiment design through Socratic dialogue with the researcher.

## <HARD-GATE>Mandatory Rules</HARD-GATE>

These rules apply to every skill. Violating any of these blocks progress.

1. **Always use the wiki** — <EXTREMELY-IMPORTANT>All research artifacts (plans, papers, entities, concepts, experiment reports) go into the `.research/` wiki directory using the specified templates and naming conventions. Never store research content outside the wiki.</EXTREMELY-IMPORTANT>

2. **Always check for handoff** — <EXTREMELY-IMPORTANT>Before starting any work, check `.research/handoff/` for the latest handoff report. If one exists, read it and resume from where the previous agent left off. Do not start from scratch.</EXTREMELY-IMPORTANT>

3. **Always handoff before stopping** — <EXTREMELY-IMPORTANT>When the session ends or you complete a skill, write a handoff report to `.research/handoff/YY-MM-DD-<skill>-<agent-name>.md` using the handoff report template. Never leave a session without a handoff.</EXTREMELY-IMPORTANT>

4. **Always use `[[wikilinks]]`** — <EXTREMELY-IMPORTANT>When mentioning any paper, entity, concept, plan, or experiment, link to its wiki page using the `[[type-slug]]` pattern. Every reference must be a wikilink, not plain text.</EXTREMELY-IMPORTANT>

5. **Always update existing pages** — <EXTREMELY-IMPORTANT>When ingesting new information, check if related entity/concept/paper pages already exist in the wiki. Update them rather than creating duplicates. Search before creating.</EXTREMELY-IMPORTANT>

6. **Always ask before executing** — <EXTREMELY-IMPORTANT>Before running scripts, making significant changes, or taking irreversible actions, confirm with the researcher. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[paper-<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entity-<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concept-<name>]]`
- `queries/` — Saved Q&A results `[[query-<topic>]]`
- `plans/` — Research plans `[[plan-v<N>]]`
- `experiments/` — Experiment reports `[[exp-<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff-<YY-MM-DD>-<skill>-<agent-name>]]`

## Before You Begin

- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Read relevant wiki artifacts from `.research/` (papers, concepts, entities, queries, plans, experiments)
- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] Read the latest backlog from `.research/plans/v<N>-backlog.md` (if any)
- [ ] Ask whether new findings should be appended to the wiki

## Use Cases

Determine which use case applies based on the current state:

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

### Case 4: Query

**Trigger:** Researcher asks a question, wants to discuss, or brainstorms around an idea without necessarily requesting plan/backlog edits.

Focus on:
- Search relevant content in `.research/` first and answer from existing artifacts
- Ground answers in existing wiki pages and use `[[wikilinks]]` when citing
- If the answer is not available in the wiki, ask for permission before web search
- After answering, ask: "Do you want to add this into our wiki?"

<EXTREMELY-IMPORTANT>Do not hallucinate missing facts. If wiki evidence is insufficient, explicitly say so and ask whether to search the web.</EXTREMELY-IMPORTANT>

## Process Flow

### Step 1: Read Context

Read all relevant existing artifacts:
- Latest plan from `.research/plans/`
- Latest backlog from `.research/plans/v<N>-backlog.md`
- Relevant `[[paper-<slug>]]`, `[[concept-<name>]]`, `[[entity-<name>]]` pages
- Any `[[handoff-<YY-MM-DD>-<skill>-<agent-name>]]` reports

### Step 2: Clarify

Ask the researcher about:
- [ ] Their goals and what they want to achieve
- [ ] Any constraints (time, resources, data availability)
- [ ] Ambiguous points in their request
- [ ] Whether this is Case 1, 2, 3, or 4 (Query)
- [ ] Whether they want new findings appended to wiki pages

### Step 3: Discuss

Engage in Socratic dialogue:
- Propose ideas and ask "what if?"
- Challenge assumptions
- Suggest alternatives and trade-offs
- Connect to existing literature via `[[wikilinks]]`
- Identify gaps in reasoning

<EXTREMELY-IMPORTANT>Do not just agree with the researcher. Your job is to stress-test ideas, expose flaws, and improve the research plan through constructive critique.</EXTREMELY-IMPORTANT>

### Step 4: Produce Response or Plan

If this is Case 4 (Query):
- [ ] Answer using wiki-grounded evidence first
- [ ] If wiki evidence is missing, ask permission before web search
- [ ] After answering, ask: "Do you want to add this into our wiki?"

If this is Case 1-3:
- [ ] Produce/update plan and backlog as below

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
- If the researcher needs supporting papers → invoke `pilot-research:pilot-literature`
- If the researcher is ready to execute tasks → invoke `pilot-research:pilot-execute`
- If the researcher wants feedback on the plan → invoke `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Before ending the session or transitioning to another skill, ask the researcher whether they want a handoff report in `.research/handoff/YY-MM-DD-brainstorm-<agent-name>.md`.</EXTREMELY-IMPORTANT>

## Templates

- `research-plan-template.md` — For creating research plans
- `backlog-template.md` — For creating task backlogs
