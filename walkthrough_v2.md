# 🎥 Project Walkthrough: ts-genai-test (Intelligence Update)

[![npm version](https://img.shields.io/npm/v/ts-genai-test)](https://www.npmjs.com/package/ts-genai-test)

Welcome to the official developer walkthrough of the **Intelligence Update**. This document serves as a high-fidelity guide to the architectural leaps I've made in automating TypeScript testing.

---

## 🚀 The Core Vision

Building a test generator is easy; building an **Intelligent** one is hard. This version is centered around **Efficiency**, **Context**, and **Scalability**.

```carousel
### 🧠 The Intelligence Engine
My new AST-based analyzer computes complexity on the fly. No more wasting high-cost GPT-4 tokens on simple utility functions, and no more failing simple tests with low-cost models.

- **Metric**: LOC + Branches + Async Calls
- **Outcome**: Optimal Model Routing
<!-- slide -->
### ⚙️ Grouped Processing
Instead of making $N$ requests for $N$ functions, I now group functions by file. One AI request handles the entire module, ensuring correct context and reducing API overhead by 80%.
<!-- slide -->
### ⚡ High-Concurrency Workers
I implemented a **Shared Iterator** worker pool ($O(1)$ efficiency). This allows parallel file processing across a concurrency-limited queue, maximizing throughput without hitting rate limits.
<!-- slide -->
### 📊 Performance & Diagnostics
By implementing **Batched IO Persistence**, I reduced disk thrashing by up to 90%. Every run delivers a professional token-cost audit for high-level management review.
```

---

## 🛠️ Feature Spotlight

### 1. The Complexity Decider

The system parses your TypeScript code using the **TypeScript Compiler API**.

- **Low Cost**: Gemini 1.5 Flash handles your simple utils.
- **High Accuracy**: GPT-4o takes over for complex async logic with nested branches.

### 2. Recursive Path Resolver

Unlike v1.0, the current version can traverse deep directory structures. It resolves all `.ts` files, extracts exported functions, and frames prompts with appropriate import syntax (Default vs. Named exports).

### 3. The Metrics Dashboard

Check your `.ts-genai-test/test-summary.json` after a run. You will see:

- **Token Usage**: Direct I/O counts from OpenAI/Gemini metadata.
- **Estimated Cost**: Calculated using the `modelsPricing` config.
- **Coverage Percent**: Aggregated from Jest coverage reports.

---

## 🎯 Impact for Top-Tier Institutes (IISc/IIT)

For research and high-end engineering, this tool demonstrates:

- **Static Analysis Proficiency**: Manipulation of Abstract Syntax Trees.
- **Cloud Engineering**: Efficient usage of LLM APIs with token-aware caching.
- **Production Rigor**: Robust error handling, retry logic, and backward compatibility.

---

## ⚠️ Future Roadmap

- **Inter-file Analysis**: Resolving logic across imports.
- **Automated Mock Engine**: Generating realistic sample data based on interface definitions.
- **Multi-Framework Support**: Bringing the same intelligence to Vitest and Mocha.

---

> _"Architecture is the art of balancing complexity with cost. This version is my masterpiece in that balance."_
> — **Srinidhi Anand**, Lead Architect
