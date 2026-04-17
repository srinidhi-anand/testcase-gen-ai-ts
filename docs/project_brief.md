# Project Brief: Intelligence-Driven Test Automation
**Principal Investigator:** Srinidhi Anand | **Repository:** [testcase-gen-ai-ts](https://github.com/srinidhi-anand/testcase-gen-ai-ts)

---

## **I. THE TOOL: AST-Informed Synthesis Architecture**
`ts-genai-test` represents a paradigm shift in autonomous software engineering, transitioning from heuristic-based code generation to a mathematically anchored **AST-informed synthesis architecture**. By decoupling static analysis from generative layers, the framework utilizes **Abstract Syntax Trees (AST)** to extract semantic invariants and structural constraints, which are then injected into a high-fidelity **Complexity-Aware Routing Engine**. This engine dynamically optimizes for the "generative frontier"—mapping code metrics to the most capable Large Language Model (LLM) for the specific task—eliminating the non-determinism inherent in general-purpose AI assistants and providing a robust, highly concurrent pipeline ($O(1)$ node efficiency) for industrial-scale TypeScript repositories.

## **II. THE RESEARCH FRONTIER: Neural-Symbolic Reliability**
This research addresses the fundamental challenge of **Neural-Symbolic Hallucination** in Automated Software Engineering (ASE). I am investigating whether **Symbolic Context Framing** (AST-based metadata injection) can provide a rigorous anchor for probabilistic code synthesis, significantly reducing the frequency of syntactically valid but semantically incorrect test logic in strongly typed environments. Furthermore, this project explores the **Computational Economics of Model Specialization**, seeking to determine the Pareto-optimal thresholds for dynamic model routing that maximize statement and branch coverage while minimizing token-latency quotients, thereby establishing a cost-effective benchmark for autonomous software reliability and "zero-configuration" testing pipelines.

---

## **III. EMPIRICAL RESULTS: Performance Benchmarks**
The following metrics were derived from the latest **test-summary.json** execution log (captured April 17, 2026), utilizing a distributed worker pool with Llama-3.3-70b as the primary synthesis engine.

| Targeted Entity | LLM Provider | Passed | Total | Success Rate | Coverage (%) | Latency (Avg) |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `isNull` | llama-3.3-70b | 53 | 64 | **82.8%** | 72.2% | 7.73s |
| `isEmptyString` | llama-3.3-70b | 50 | 62 | **80.6%** | 72.2% | 7.62s |
| `isNullLike` | llama-3.3-70b | 48 | 61 | **78.7%** | 72.2% | 7.38s |
| `isObject` | llama-3.3-70b | 49 | 62 | **79.0%** | 72.2% | 7.69s |
| `isUndefined` | llama-3.3-70b | 55 | 63 | **87.3%** | 72.2% | 6.86s |
| **AGGREGATED** | | **51** | **62.4** | **81.7%** | **72.2%** | **7.45s** |

> [!IMPORTANT]
> **Success Rate** represents "zero-human-intervention" pass percentage on Jest execution. **Coverage** metrics represent branch and statement coverage reached on the targeted module.

---

## **IV. COLLABORATION PROPOSAL**
I am seeking collaborations with institutes like **IISc, IITs, CMU, and Stanford** specializing in **Static Analysis, LLMs for Code, or Software Reliability**. My objective is to:
- **Quantify AST-Framing Accuracy**: Establish formal error bounds for LLM code generation.
- **Optimize Routing Heuristics**: Develop higher-order metrics for model-to-code mapping.
- **Graph-Based Context Injection**: Automate dependency resolution and mocking across massive repositories.

**Contact:** [Srinidhi Anand](mailto:srinidhianand4@gmail.com) | [GitHub Profile](https://github.com/srinidhi-anand)  
**Project Repository:** [testcase-gen-ai-ts](https://github.com/srinidhi-anand/testcase-gen-ai-ts)
