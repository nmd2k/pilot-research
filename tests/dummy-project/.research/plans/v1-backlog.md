---
type: backlog
title: "Backlog v1"
date: 2025-01-15
plan: "[[plan-v1]]"
---

# Backlog: Plan v1

| ID | Task | Status | Assignee | Depends on | Links |
|----|------|--------|----------|------------|-------|
| T1 | Select and configure LLM models for evaluation (GPT-4, Claude 3.5 Sonnet, Llama-3-70B, Mistral-7B) | todo | agent | — | |
| T2 | Prepare benchmark dataset (GSM8K, MATH) with stratified difficulty labels | todo | agent | — | |
| T3 | Design evaluation pipeline: prompt templates, API wrappers, result parsing | todo | agent | T1, T2 | [[exp-baseline-eval]] |
| T4 | Run baseline experiments on all models with standard prompting | todo | agent | T3 | [[exp-baseline-eval]] |
| T5 | Analyze failure modes: classify errors, compute per-category statistics | todo | human | T4 | |
| T6 | Write results summary and error taxonomy report | todo | human | T5 | |