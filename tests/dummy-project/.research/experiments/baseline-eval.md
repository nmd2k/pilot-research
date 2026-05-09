---
type: experiment-report
experiment: "baseline-eval"
date: 2025-01-15
status: in-progress
tags: [evaluation, baseline, gsm8k, math-reasoning]
---

# Experiment Report: Baseline LLM Evaluation on GSM8K

## Objective

Evaluate GPT-4, Claude 3.5 Sonnet, Llama-3-70B, and Mistral-7B on the GSM8K benchmark using standard zero-shot prompting to establish baseline accuracy before testing [[concept-chain-of-thought]] and few-shot strategies.

## Methodology Summary

- Dataset: GSM8K (8,792 grade-school math word problems, test split of 1,319 problems)
- Models: GPT-4 (gpt-4-0613), Claude 3.5 Sonnet, Llama-3-70B-Instruct, Mistral-7B-Instruct
- Prompt: Zero-shot with instruction "Solve the following math problem. Provide only the final numerical answer."
- Evaluation: Exact match on the final numerical answer after normalization (commas, units stripped)
- Temperature: 0 for all models to ensure deterministic outputs
- Token limit: 512 tokens per response
- Each model was queried via its respective API with retry logic for rate limits

## Results

In progress. Partial results obtained:

| Model | Accuracy (partial, 200/1319 problems) | Avg. tokens/response |
|-------|---------------------------------------|----------------------|
| GPT-4 | 89.5% | 42 |
| Claude 3.5 Sonnet | 87.0% | 38 |
| Llama-3-70B | 71.5% | 55 |
| Mistral-7B | 34.0% | 63 |

Full evaluation run is ongoing. Error analysis has not yet been performed on the partial results.

## Analysis

Preliminary observations based on 200-problem subset:

- GPT-4 and Claude 3.5 Sonnet perform comparably at the top end, consistent with published benchmarks
- Llama-3-70B shows a significant gap from frontier models, particularly on multi-step problems
- Mistral-7B struggles substantially, often failing to produce valid numerical answers
- Common failure pattern: smaller models produce the correct operation but make arithmetic errors in execution

## Conclusions

TBD — awaiting completion of full evaluation run across all 1,319 problems per model.

## Lessons Learned

- Mistral-7B frequently produces non-numeric outputs; the normalization parser needs updating to handle this
- Rate limiting on OpenAI and Anthropic APIs caused intermittent failures; implemented exponential backoff
- GSM8K answer format includes "####" delimiters that need to be stripped from reference answers

## Issues Discovered

- Some Mistral-7B responses contain the reasoning process despite zero-shot instruction, producing irrelevant text that confuses the answer parser
- Anthropic API returns different response formats for streaming vs. non-streaming; switched to non-streaming for consistency

## Artifacts Produced

- [[exp-baseline-eval]]

## Related Plan

[[plan-v1]]