# 🎓 Research Collaboration Proposal: Intelligence-Driven Test Automation

## **Project Overview**

`ts-genai-test` is a high-performance, AST-aware framework designed to automate the generation of Jest unit tests for TypeScript ecosystems. Unlike standard AI coding assistants, this system implements a **Complexity-Aware Routing Engine** that maps source code metrics (AST-based) to optimal LLM providers. My goal is to bridge the gap between deterministic static analysis and probabilistic generative AI to create a "zero-configuration" autonomous testing pipeline.

---

## **Research Pillars**

I am seeking collaboration with academic partners to explore the following frontiers:

### 1. **Neural-Symbolic Test Synthesis**

Using Abstract Syntax Trees (AST) to guide Large Language Models (LLMs) in generating tests that aren't just syntactically correct, but semantically rigorous.

- **Research Question:** Can AST-based framing significantly reduce "hallucinated" test logic in strongly typed environments?

### 2. **Computational Economics of AI in SE**

My engine dynamically routes tasks to Gemini, OpenAI, or Groq based on a weighted complexity score (LOC + Cyclomatic Complexity + Async density).

- **Research Question:** What are the optimal thresholds for "model-switching" to maximize code coverage while minimizing API overhead/cost?

### 3. **Autonomous Mocking & Dependency Injection**

The next phase of the project involves "Inter-file Analysis"—mapping imports and interfaces across a codebase to generate realistic mocks automatically.

- **Research Question:** Can I build a graph-based representation of a repository to provide the LLM with "Just-in-Time" context for external dependencies?

---

## **Why Collaborate with Me?**

- **Production-Ready Base**: A modular, pnpm-based TypeScript codebase with a high-concurrency worker pool ($O(1)$ efficiency).
- **Integrated Metrics**: Every execution tracks token usage, estimated costs, and Jest coverage, providing a built-in benchmark for empirical studies.
- **Open Access**: I am committed to open-source excellence and providing a platform for PhD/Master’s research in Automated Software Engineering (ASE).

---

## **Current Technical Moats**

- **AST-Based Complexity Decider**: Proprietary logic to evaluate function "hardness."
- **Shared Iterator Workers**: High-performance task queue for massive repo processing.
- **Grouped Context Framing**: 1-File-1-AI unit processing to maintain module-level coherence.

---

## **Contact & Collaboration**

I am looking for research faculty from institutes like IISc, IITs, CMU, and Stanford specializing in **Static Analysis, LLMs for Code, or Software Reliability**.

**Architect & Lead:** [Srinidhi Anand](mailto:srinidhianand4@gmail.com) ([GitHub](https://github.com/srinidhi-anand))  
**Project Repository:** [testcase-gen-ai-ts](https://github.com/srinidhi-anand/testcase-gen-ai-ts)
