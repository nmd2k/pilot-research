---
name: pilot-peer-review
description: "Use when researcher wants feedback on their research plan, literature review, experiment design, or paper draft"
---

# Peer Review

This skill provides structured, rigorous feedback on research artifacts using defined review criteria and severity levels.

## <HARD-GATE>Mandatory Rules</HARD-GATE>

These rules apply to every skill. Violating any of these blocks progress.

1. **Always use the wiki** — <EXTREMELY-IMPORTANT>All research artifacts (plans, papers, entities, concepts, experiment reports) go into the `.research/` wiki directory using the specified templates and naming conventions. Never store research content outside the wiki.</EXTREMELY-IMPORTANT>

2. **Always check for handoff** — <EXTREMELY-IMPORTANT>Before starting any work, check `.research/handoff/` for the latest handoff report. If one exists, read it and resume from where the previous agent left off. Do not start from scratch.</EXTREMELY-IMPORTANT>

3. **Always handoff before stopping** — <EXTREMELY-IMPORTANT>When the session ends or you complete a skill, write a handoff report to `.research/handoff/YY-MM-DD-<skill>-<agent-name>.md` using the handoff report template. Never leave a session without a handoff.</EXTREMELY-IMPORTANT>

4. **Always refer to wiki links** — <EXTREMELY-IMPORTANT>When mentioning any paper, entity, concept, plan, or experiment, link to its wiki page using your platform's native link format (e.g., `[[papers/slug]]` or `papers/slug`). Every reference must link to the wiki, not use plain text.</EXTREMELY-IMPORTANT>

5. **Always update existing pages** — <EXTREMELY-IMPORTANT>When ingesting new information, check if related entity/concept/paper pages already exist in the wiki. Update them rather than creating duplicates. Search before creating.</EXTREMELY-IMPORTANT>

6. **Always ask before executing** — <EXTREMELY-IMPORTANT>Before running scripts, making significant changes, or taking irreversible actions, confirm with the researcher. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Confirm which artifact the researcher wants reviewed
- [ ] Confirm the artifact type (plan, literature review, experiment, or paper)

<EXTREMELY-IMPORTANT>You must review the actual wiki artifact, not just discuss it from memory. Read the artifact from the wiki before reviewing.</EXTREMELY-IMPORTANT>

## Process Flow

### Step 1: Read Artifact

Read the specified research artifact from the wiki:
- [ ] Research plan → `.research/plans/v<N>.md`
- [ ] Literature review → relevant `.research/papers/`, `.research/entities/`, `.research/concepts/` pages
- [ ] Experiment design → `.research/experiments/<name>.md`
- [ ] Paper draft → the paper file as specified by the researcher

Also read supporting context:
- [ ] The research plan (for any review, to understand the big picture)
- [ ] Linked `[[wikilinks]]` to understand referenced content
- [ ] Any previous review feedback (if this is a re-review)

### Step 2: Apply Rubric

Review the artifact against the criteria defined in `review-rubric.md` and the relevant criteria table below:

| Artifact | Criteria |
|----------|----------|
| Research plan | Clarity, feasibility, originality, significance |
| Literature review | Relevance, accuracy, completeness, coverage |
| Experiment design | Validity, reliability, reproducibility, ethicality |
| Paper draft | Structure, clarity, evidence, citation completeness |

For each criterion, assess:
- [ ] Does the artifact meet the standard?
- [ ] What specific issues exist?
- [ ] What would make it stronger?

<EXTREMELY-IMPORTANT>Be thorough and honest. Do not softball the review. The researcher is asking for feedback to improve their work, not for validation.</EXTREMELY-IMPORTANT>

### Step 3: Classify Issues

Assign a severity level to every issue found:

| Severity | Definition | Action Required |
|----------|-----------|-----------------|
| **Critical** | Blocks progress. The artifact cannot serve its purpose without fixing this. | Must fix before proceeding. |
| **Major** | Significant problem that reduces quality or trustworthiness. Should fix. | Should fix before the next stage. |
| **Minor** | Informational. Small improvements that would polish the artifact. | Nice to have, can address later. |

- [ ] Every issue has a severity level
- [ ] Critical issues are clearly identified and separated
- [ ] No issue is left unclassified

### Step 4: Write Review

Present structured feedback to the researcher:

```
## Review: [Artifact Type] — [Artifact Name]

### Summary
[2-3 sentence overall assessment]

### Critical Issues
- [ ] [Issue 1]: [Description] → [Suggested fix]
- [ ] [Issue 2]: [Description] → [Suggested fix]

### Major Issues
- [ ] [Issue 1]: [Description] → [Suggested fix]
- [ ] [Issue 2]: [Description] → [Suggested fix]

### Minor Issues
- [ ] [Issue 1]: [Description] → [Suggested fix]

### Strengths
- [Strength 1]
- [Strength 2]
```

<EXTREMELY-IMPORTANT>For every issue, provide a concrete suggestion for fixing it. Do not just say "this is unclear" — say "this is unclear; restructure section X to lead with Y before discussing Z."</EXTREMELY-IMPORTANT>

### Step 5: Suggest Fixes

For each issue, provide:
- [ ] A specific, actionable fix suggestion
- [ ] The wiki page or section that needs to be updated
- [ ] Examples or references where appropriate
- [ ] Whether fixing this issue requires invoking another skill

If fixing an issue requires:
- More brainstorming → invoke `pilot-research:pilot-brainstorm`
- More literature → invoke `pilot-research:pilot-literature`
- More experiments → invoke `pilot-research:pilot-execute`
- Paper revision → invoke `pilot-research:pilot-write-paper`

## Review Criteria Detail

### Research Plan Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Clarity** | Is the research question specific? Is the hypothesis testable? Can someone else understand and replicate this? |
| **Feasibility** | Are the proposed methods realistic given resources? Are the success criteria achievable? Are dependencies identified? |
| **Originality** | Does this address a gap? How does it differ from existing work? Is the contribution novel? |
| **Significance** | Why does this matter? Who benefits? What would change if this research succeeds? |

### Literature Review Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Relevance** | Are the papers actually relevant to the research question? Are there obviously missing areas? |
| **Accuracy** | Are the summaries correct? Are characterizations of methods and results faithful to the original papers? |
| **Completeness** | Are key papers missing? Are important venues covered? Is the time range appropriate? |
| **Coverage** | Does the review cover different perspectives? Contradictory findings? Is it balanced? |

### Experiment Design Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Validity** | Does the experiment actually test the hypothesis? Are controls appropriate? Are confounds addressed? |
| **Reliability** | Would the experiment produce similar results if repeated? Are the measurements robust? |
| **Reproducibility** | Can someone else reproduce this? Are all variables, data, and procedures documented? |
| **Ethicality** | Are there ethical concerns? Data privacy? Consent? Potential harm? |

### Paper Draft Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Structure** | Does the paper follow a logical structure? Are sections in the right order? Is the narrative coherent? |
| **Clarity** | Is the writing clear? Are terms defined? Are figures and tables helpful? |
| **Evidence** | Are claims supported by data? Are results presented honestly? Are limitations acknowledged? |
| **Citation completeness** | Are all claims properly cited? Is the related work section thorough? Are citations accurate? |

## Red Flags

| Red Flag | Why It Matters |
|----------|---------------|
| Reviewing from memory instead of the artifact | Feedback will be inaccurate and incomplete |
| No critical issues found | Every artifact has room for improvement; look harder |
| Vague suggestions without concrete fixes | Unactionable feedback wastes the researcher's time |
| Skipping the criteria rubric | Leads to inconsistent, subjective reviews |
| Ignoring the research context | Feedback may not be relevant to the researcher's goals |

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "It looks fine to me" | Every artifact has issues. Your job is to find them. |
| "I don't want to be too harsh" | Honest feedback helps. Sugarcoating wastes time. |
| "The researcher can figure out the fix" | Suggest a concrete fix. That's what makes feedback actionable. |
| "This is outside my expertise" | Apply the rubric criteria. You don't need domain expertise to assess clarity, structure, and completeness. |

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YY-MM-DD-review-<agent-name>.md` before ending the session, including the review results and any pending fixes.</EXTREMELY-IMPORTANT>

## Templates

- `review-rubric.md` — Detailed rubric for each artifact type and criterion
