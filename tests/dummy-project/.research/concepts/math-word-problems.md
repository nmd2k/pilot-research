---
type: concept
name: "Math Word Problems"
concept_type: other
description: "A class of natural language problems requiring translation from verbal descriptions to mathematical expressions and multi-step arithmetic reasoning."
tags: [benchmark, mathematics, reasoning, evaluation]
---

# Math Word Problems

## Definition

Math Word Problems (MWPs) are natural language questions that describe a scenario requiring mathematical computation. They demand both linguistic comprehension — parsing the problem text — and symbolic reasoning — selecting and executing the appropriate operations. MWPs serve as a standard benchmark domain for evaluating LLM reasoning capabilities.

## How It Works

1. A problem is presented in natural language (e.g., "John has 5 apples and gives 2 to Mary. How many does he have left?")
2. The solver must identify relevant quantities, relationships, and operations
3. An equation or sequence of operations is constructed
4. Operations are executed to produce a numerical answer
5. The answer is expressed in the requested format

Problem difficulty scales with the number of reasoning steps, the complexity of operations, and the presence of distractors or unusual structures.

## Strengths

- Provides a well-studied, objective evaluation metric (exact match on numerical answers)
- Spans a wide difficulty range from grade-school arithmetic to olympiad-level problems
- Requires genuine multi-step reasoning rather than pattern matching
- Large-scale curated datasets are publicly available (GSM8K, MATH, ASDiv)

## Limitations

- Oversimplifies "mathematical reasoning" to numerical computation
- May not capture creative or proof-based mathematical thinking
- Answer-based evaluation ignores reasoning process quality
- Dataset contamination is a concern for models trained on web data

## Applications

- Standard LLM evaluation benchmark (GSM8K, MATH dataset)
- Educational technology and tutoring systems
- Diagnostic tool for identifying reasoning gaps in AI systems
- Comparing symbolic vs. neural reasoning approaches

## Related Papers

- [[paper-cot-Reasoning]]

## Related Entities

- [[entity-wei-jason]]

## Related Concepts

- [[concept-chain-of-thought]]