---
type: concept
name: "Chain of Thought"
concept_type: method
description: "A prompting technique that directs language models to produce intermediate reasoning steps before arriving at a final answer."
tags: [prompting, reasoning, llm]
---

# Chain of Thought

## Definition

Chain of Thought (CoT) is a prompting strategy for large language models where the model is instructed — via exemplars or explicit direction — to generate a sequence of intermediate reasoning steps before outputting its final answer. Rather than producing the answer directly, the model articulates its reasoning process, which improves accuracy on tasks requiring multi-step inference.

## How It Works

1. Provide the model with few-shot exemplars that include step-by-step reasoning before each answer
2. The model learns to mimic this pattern, outputting its own reasoning chain
3. Each step in the chain builds on the previous one, decomposing a complex problem into manageable sub-problems
4. The final answer is derived from the accumulated reasoning

Zero-shot CoT is a variant where the prompt simply includes "Let's think step by step" without exemplars.

## Strengths

- Dramatically improves performance on multi-step reasoning tasks without model modifications
- Enables debugging of model outputs by inspecting intermediate steps
- Works as a drop-in enhancement to existing prompting pipelines
- No additional training or fine-tuning required

## Limitations

- Emerges reliably only in large models (approximately 100B+ parameters)
- Generated reasoning chains can be plausible but logically incorrect
- Adds to inference cost due to longer output sequences
- Sensitive to exemplar quality and ordering
- Does not guarantee that the model truly "reasons" versus pattern-matching surface forms

## Applications

- Mathematical problem solving (arithmetic, algebra, competition math)
- Multi-hop question answering
- Commonsense reasoning benchmarks
- Code generation with intermediate planning
- Scientific reasoning and hypothesis evaluation

## Related Papers

- [[paper-cot-Reasoning]]

## Related Entities

- [[entity-wei-jason]]

## Related Concepts

- [[concept-math-word-problems]]