---
name: execute-research
description: "Use when researcher wants to execute research tasks from the backlog, run experiments, or manage the research process with sub-agents"
---

# Execute Research

This skill manages research execution using a **leader/worker pattern**. The main agent acts as the leader, coordinating tasks and spawning sub-agents (workers) to execute individual experiments.

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Read the latest research plan from `.research/plans/v<N>.md`
- [ ] Read the latest backlog from `.research/plans/v<N>-backlog.md`
- [ ] Confirm the backlog has tasks ready for execution

<EXTREMELY-IMPORTANT>You cannot execute research without a plan and backlog. If these are missing, invoke `pilot-research:brainstorming` first.</EXTREMELY-IMPORTANT>

## Leader / Worker Pattern

### Leader (main agent using `leader-prompt.md`)

The leader is responsible for:
- Reading the plan and backlog
- Deciding which tasks to execute and in what order
- Spawning workers with clear, specific instructions
- Reviewing worker results for quality and completeness
- Updating the backlog status and plan as needed
- Writing handoff reports when sessions transition

The leader does **not** execute tasks directly. It coordinates.

### Worker (sub-agent using `worker-prompt.md`)

Each worker receives:
- A single task description from the backlog
- Relevant wiki context (plan, experiment design, related papers/concepts)
- The experiment design template to follow

Each worker produces:
- An experiment report using `experiment-report-template.md`
- Updated wiki pages (if the experiment reveals new entities or concepts)
- A summary report back to the leader

Each worker must:
- Follow the `experiment-design-template.md` structure
- Write results to the wiki using proper `[[wikilinks]]`
- Report back with a clear summary of findings

## Process Flow

### Step 1: Read Context

Gather all relevant state:
- [ ] Read the latest plan from `.research/plans/v<N>.md`
- [ ] Read the latest backlog from `.research/plans/v<N>-backlog.md`
- [ ] Read any `[[handoff-<YYYY-MM-DD>]]` reports
- [ ] Review any in-progress experiment reports in `.research/experiments/`
- [ ] Note which tasks are done, in-progress, and pending

### Step 2: Identify Next Tasks

From the backlog, identify tasks ready to execute:
- [ ] Task status is `todo`
- [ ] All dependency tasks are `done`
- [ ] Required resources (data, code, models) are available
- [ ] The task aligns with the researcher's current priorities

<EXTREMELY-IMPORTANT>Never start a task whose dependencies are not met. Check the "Depends on" column in the backlog before selecting tasks.</EXTREMELY-IMPORTANT>

### Step 3: Plan Execution

Present the execution plan to the researcher:
- [ ] Which tasks will be executed and in what order
- [ ] What sub-agents will be spawned for each task
- [ ] What resources are needed
- [ ] Estimated time or complexity for each task
- [ ] Any risks or blockers

<EXTREMELY-IMPORTANT>Always confirm the execution plan with the researcher before spawning any workers. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

### Step 4: Spawn Workers

For each task, spawn a sub-agent with `worker-prompt.md`:
- [ ] Provide the task description from the backlog
- [ ] Provide relevant wiki context (plan, related papers, concepts, entities)
- [ ] Specify the experiment design to follow
- [ ] Specify where to write results (`.research/experiments/<name>.md`)
- [ ] Specify naming conventions for artifacts

Worker instructions must include:
- The task ID (e.g., T3)
- The specific hypothesis or objective being tested
- Which `[[wikilinks]]` are relevant
- Where to save the experiment report
- What format the results should follow

### Step 5: Gather Results

After each worker completes:
- [ ] Review the experiment report for completeness
- [ ] Check that results are saved to the wiki
- [ ] Check that `[[wikilinks]]` are correct
- [ ] Ask the researcher if results are satisfactory
- [ ] If results are unsatisfactory, discuss whether to retry, adjust, or move on

### Step 6: Plan Next Steps

Based on results:
- [ ] Update the backlog: mark completed tasks as `done`, update in-progress tasks
- [ ] Add new tasks if results reveal new work needed
- [ ] Update the research plan if results change the direction
- [ ] Determine which tasks are now unblocked and ready for execution
- [ ] Ask the researcher whether to continue with more tasks or pause

### Step 7: Handoff

Write a handoff report to `.research/handoff/YYYY-MM-DD.md` using `handoff-report-template.md`:
- [ ] What was done (completed tasks)
- [ ] What was left undone (pending tasks)
- [ ] Commands run (with exit codes)
- [ ] Issues discovered
- [ ] Key decisions made (and why)
- [ ] Artifacts produced (with `[[wikilinks]]`)
- [ ] Suggested next steps

<EXTREMELY-IMPORTANT>Every session that does research work must produce a handoff report. No exceptions.</EXTREMELY-IMPORTANT>

## Red Flags

| Red Flag | Why It Matters |
|----------|---------------|
| No research plan exists | Cannot execute without direction; invoke `pilot-research:brainstorming` |
| No backlog exists | No tasks to execute; invoke `pilot-research:brainstorming` |
| Starting a task before dependencies are met | Will produce invalid or incomplete results |
| Worker produces results without wikilinks | Breaks the knowledge graph |
| Skipping the researcher confirmation step | May execute unwanted or incorrect tasks |
| Not writing handoff reports | Next agent has no context and must start from scratch |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The task is simple, I'll just do it myself" | The leader/worker pattern ensures traceability and isolation. Use it. |
| "I'll skip the handoff, the session is short" | Any work done without a handoff is lost context. Always handoff. |
| "The backlog is outdated, I'll improvise" | Update the backlog first, then execute. Improvising breaks the chain. |
| "Dependencies are probably done" | Check. Never assume. Blocked dependencies produce invalid results. |

## Transitioning to Other Skills

After completing execution:
- If experiments produce results worth writing up → invoke `pilot-research:write-paper`
- If results suggest the plan needs refinement → invoke `pilot-research:brainstorming`
- If more literature is needed to interpret results → invoke `pilot-research:literature-review`
- If researcher wants feedback on experiment design → invoke `pilot-research:peer-review`

## Templates

- `leader-prompt.md` — Prompt template for the leader agent
- `worker-prompt.md` — Prompt template for worker sub-agents
- `experiment-design-template.md` — For designing experiments before execution
- `experiment-report-template.md` — For writing experiment results
- `handoff-report-template.md` — For session handoff reports