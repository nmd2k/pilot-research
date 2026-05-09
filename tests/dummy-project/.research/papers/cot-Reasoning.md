---
type: paper
title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
authors:
  - Jason Wei
  - Xuezhi Wang
  - Dale Schuurmans
  - Maarten Bosma
  - Brian Ichter
  - Fei Xia
  - Ed Chi
  - Quoc Le
  - Denny Zhou
year: 2022
doi: ""
arxiv_id: "2201.11903"
url: "https://arxiv.org/abs/2201.11903"
date_reviewed: 2025-01-15
tags: [reasoning, prompting, chain-of-thought, llm]
---

# Chain-of-Thought Prompting Elicits Reasoning in Large Language Models

## One-line Summary

Demonstrates that generating intermediate reasoning steps before producing an answer dramatically improves LLM performance on complex reasoning tasks.

## Key Contribution

Introduces chain-of-thought (CoT) prompting — a simple technique where the model is prompted to produce a series of intermediate reasoning steps before giving a final answer. Shows that this approach enables large language models to solve multi-step reasoning problems that are otherwise intractable with standard prompting, achieving state-of-the-art results on GSM8K, SVAMP, and other benchmarks.

## Methodology

- Evaluated on arithmetic (GSM8K, SVAMP, AQuA), commonsense (CSQA, StrategyQA), and symbolic reasoning benchmarks
- Compared three prompting strategies: standard prompting, few-shot prompting, and few-shot CoT prompting
- CoT examples were manually written by annotators and included step-by-step reasoning before the final answer
- Tested across model scales, finding that CoT emerges as an effective strategy primarily in models with ~100B+ parameters

## Results

- GSM8K accuracy improved from 17.1% (standard) to 56.9% (CoT) with PaLM 540B
- Smaller models (40B) showed minimal benefit from CoT, suggesting a scale-dependent emergence
- CoT matched or exceeded fine-tuned models on several benchmarks without any parameter updates
- Performance gains were most pronounced on problems requiring 3+ reasoning steps

## Limitations

- CoT is primarily effective in large models (100B+ parameters); smaller models do not benefit
- Requires manually crafted exemplars; quality of exemplars affects results
- No theoretical explanation for why CoT works or why it emerges at scale
- Does not guarantee correctness — models can produce plausible but wrong reasoning chains

## Relevance to Our Research

Directly foundational. Our experiment E2 tests CoT prompting as one of the three prompting strategies. The scale-dependency finding is especially relevant since we are evaluating models of varying sizes (7B to GPT-4 scale). The error patterns identified in CoT outputs (plausible but flawed chains) are a key failure mode we will annotate in T5.

## Connections

- Introduces concept: [[concept-chain-of-thought]]
- Uses method: [[concept-math-word-problems]]
- Related entity: [[entity-wei-jason]]