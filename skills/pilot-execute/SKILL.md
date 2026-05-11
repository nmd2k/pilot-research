---
name: pilot-execute
description: "Use when researcher wants to execute research tasks from the backlog, run experiments, or manage the research process with sub-agents"
---

# Execute Research

Leader/worker pattern for executing research tasks. The current agent is the leader — it coordinates workers, validates outputs, and manages the backlog.
## Hard-Gate: Mandatory Rules

1. **Wiki is source of truth** — All artifacts (papers, entities, concepts, plans, experiments) go into `.research/` using specified templates. Every reference uses wiki links (`[[papers/slug]]`). Before creating new pages, check for existing ones and update them. Links must be bidirectional.
2. **Always handoff** — Check `.research/handoff/` before starting; write a handoff report before stopping. Never leave a session without one.
3. **Ask before executing** — Confirm with the researcher before running scripts, spawning workers, or taking irreversible actions.

## Research Wiki Structure

All content lives in `.research/`:
- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts

## Before You Begin

Read all relevant context:
- [ ] Check `.research/handoff/` for previous handoff; resume if found
- [ ] Read the latest plan from `.research/plans/v<N>.md`
- [ ] Read the latest backlog from `.research/plans/v<N>-backlog.md`
- [ ] Review in-progress experiment reports in `.research/experiments/`
- [ ] Note which tasks are done, in-progress, and pending

<EXTREMELY-IMPORTANT>Cannot execute without a plan and backlog. If missing, invoke `pilot-research:pilot-brainstorm` first.</EXTREMELY-IMPORTANT>

## Leader / Worker Pattern

### Leader

The leader coordinates — it does not execute experiments directly:
- Reads plan and backlog, identifies ready tasks
- Spawns workers with clear, specific instructions
- Reviews worker results for quality, completeness, and correctness
- Updates backlog and plan as tasks complete
- Writes handoff reports

### Worker

Each worker receives task(s) from the backlog via `worker-prompt.md`:
- Task ID, hypothesis, relevant wiki context
- Experiment design to follow (`experiment-design-template.md`)
- Output path for the experiment report

Each worker produces:
- Experiment report using `experiment-report-template.md`
- Updated wiki pages for new entities/concepts discovered
- Summary report back to the leader

## Process Flow

### Step 1: Identify Ready Tasks

From the backlog, find tasks where:
- [ ] Status is `todo`
- [ ] All dependencies are `done`
- [ ] Required resources are available

### Step 2: Plan & Confirm

Present the execution plan to the researcher:
- [ ] Which tasks, in what order, how many workers
- [ ] Resources needed, risks, blockers
- [ ] Get explicit approval before spawning any workers

### Step 3: Spawn Workers

For each approved task, spawn a sub-agent with `worker-prompt.md`:
- Task ID, hypothesis, relevant `[[wikilinks]]`
- Experiment design template to follow
- Output path: `.research/experiments/<name>.md`
- Validation criteria the output must satisfy

### Step 4: Gather & Validate

As workers complete:
- [ ] Review experiment reports for completeness, wiki links, results vs. criteria
- [ ] If quality is insufficient, send revision feedback and rerun
- [ ] Present results to researcher for confirmation
- [ ] Mark completed tasks as `done` in the backlog

### Step 5: Plan Next Steps

- [ ] Add new tasks if results reveal additional work needed
- [ ] Update the research plan if findings change the direction
- [ ] Determine which tasks are now unblocked
- [ ] Ask researcher: continue with more tasks or pause?

### Step 6: Handoff

Write a handoff report to `.research/handoff/YY-MM-DD-execute-<agent-name>.md` using `handoff-report-template.md`. Include: completed tasks, pending tasks, key decisions, artifacts produced, suggested next steps.

## Red Flags

| Red Flag | Why It Matters |
|---|---|
| No plan or backlog | No direction or tasks; invoke `pilot-brainstorm` first |
| Starting tasks with unmet dependencies | Produces invalid results |
| Skipping researcher confirmation | May execute unwanted or incorrect tasks |
| Worker output missing wiki links | Breaks the knowledge graph |
| No handoff report | Next session loses all context |
| Leader doing work instead of delegating | Defeats the leader/worker pattern — traceability and isolation are lost |

## Transitioning to Other Skills

- Experiments worth writing up → `pilot-research:pilot-write-paper`
- Results suggest plan revision → `pilot-research:pilot-brainstorm`
- Need literature to interpret results → `pilot-research:pilot-literature`
- Want feedback on experiment design → `pilot-research:pilot-peer-review`

## Templates

- `worker-prompt.md` — Prompt template for worker sub-agents
- `experiment-design-template.md` — For designing experiments before execution
- `experiment-report-template.md` — For writing experiment results
- `handoff-report-template.md` — For session handoff reports
