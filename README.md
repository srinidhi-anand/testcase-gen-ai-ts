# ts-genai-test

🚀 **The Intelligent, Complexity-Aware Jest Test Generator for TypeScript**

`ts-genai-test` is a high-performance developer tool that uses **AST-based code analysis** to automatically generate optimized Jest unit tests. It doesn't just call an AI; it calculates code complexity to route your requests to the most efficient LLM provider (Gemini, OpenAI, or Groq), saving you costs while maximizing test accuracy.

---

🔗 **[View the Technical Walkthrough](./walkthrough_v2.md)** (Architecture, CLI Demo & Deep Dive)

Built with pnpm and optimized for TypeScript-first projects.

---

## 📦 npm Package

🔗 [![npm version](https://img.shields.io/npm/v/ts-genai-test)](https://www.npmjs.com/package/ts-genai-test)

---

## 🧩 GitHub Repository

🔗 https://github.com/srinidhi-anand/testcase-gen-ai-ts

## 🚀 Features

- **Grouped Processing (1-File-1-AI)**: Aggregates multiple functions into a single AI request per file, reducing API overhead by up to 80%.
- **High-Concurrency Workers**: Uses a **Shared Iterator** worker pool ($O(1)$ efficiency) to process file groups in parallel without hitting rate limits.
- **Intelligent Model Selection**: Dynamically selects LLMs based on AST-based code complexity analysis.
- **Complexity-Aware Routing**: Maps complexity scores to optimal providers (`openai`, `gemini`, `groq`).
- **Manual & Automated CLI**: Supports Git staged detection (`generate`) or manual path targeting (`run`).
- **Flexible Override Policies**: Choose between `auto`, `suggest`, or `never` for AI model swaps.
- **Execution Metrics & Costs**: Tracks token usage and calculates estimated costs per test case.
- **Recursive Directory Scanning**: Scans entire module folders for TypeScript functions automatically.
- **Strict Output Format**: Produces valid `.test.ts` files with hardened safety against infinite-nesting hallucinations.

---

## 🧰 Tech Stack

- TypeScript
- Node.js
- pnpm (v10.24.0)
- Jest
- Generative AI (LLM-based test generation)

---

## 📦 Installation

Using **pnpm** (recommended):

```bash
pnpm install ts-genai-test
```

or using **npm**

```bash
npm install ts-genai-test
```

## ⚙️ Configuration (.env)

The tool utilizes environment variables to drive its intelligence engine. Create a `.env` file in your project root:

```ini
# --- Core Credentials ---
AI_API_KEY=your_api_key_here

# --- Provider & Model (Optional - overridden by Intelligence by default) ---
LLM=openai              # openai | gemini | groq
MODEL=gpt-4o-mini       # specific model name

# --- Intelligence Preferences ---
AI_PREFERENCE=balanced  # high-accuracy | low-cost | balanced
AI_MODE=auto            # auto | manual (manual locks strictly to your MODEL)
AI_OVERRIDE_POLICY=auto # auto | suggest | never
```

> [!NOTE]
> **Backward Compatibility:** Legacy variables (`AI_MODEL`, `AI_MODEL_NAME`) are still supported in this version but will trigger a deprecation warning in the console. I explicitly recommend migrating to the new standard above.

---

## 🚀 Usage

#### Basic Example (Deprecated)

> [!CAUTION]
> **Programmatic usage (Basic Example) is now deprecated.** To improve your workflow efficiency, I strongly recommend using the **CLI interface** instead of manually framing `inputPrompt` arrays and calling `generateTests` programs. Support for this manual execution pattern may be removed in future major versions.

```Typescript
import path from "path";
import { generateTests, functionalTypes } from "ts-genai-test";
const inputPrompt: functionalTypes.PromptInput[] = [
  {
    outputTestDir: path.resolve(__dirname, "../__tests__"), // optional test suite directory, defaults to 'tests' folder
    folderPath: path.resolve(__dirname, "../src"),  // source folder
    filePath: path.resolve(__dirname, "../src/index"), // source file
    functionName: "add", // function to generate tests for
    testFileName: "" // optional custom test file name
    rootPath: "" // optional if outputTestDir is provided else its mandatory to form tests folder path
  }
];

await generateTests(inputPrompt);
```

The generated Jest test file will be created automatically inside the
specified test directory.

#### 📊 Intelligent Model Decider (Auto-Pilot)

The system calculates a **Complexity Score** based on Lines of Code (LOC), Branching (if/switch/ternary), and Async/Await usage.

- **Low Complexity (< 25)**: Routes to `gemini-1.5-flash` (Low-cost).
- **Medium Complexity (25-60)**: Routes to `gpt-4o-mini` (Balanced).
- **High Complexity (> 60)**: Routes to `gpt-4o` (High-accuracy).

#### 🖥️ CLI Commands

| Command    | Behavior                                                                   |
| :--------- | :------------------------------------------------------------------------- |
| `generate` | **(Default)** Only processes files currently **staged** in your Git index. |
| `run`      | Manually processes files/folders based on the `--path` flag (ignores Git). |

**Available CLI Flags:**

- `--path <string>`: Required for `run`. Can be used as a filter for `generate`.
- `--function <string>`: Isolates generation strictly to one specific function name.
- `--override`: Forces regeneration of existing test files (defaults `false`).
- `--root <path>`: Manually set the project root for complex monorepo structures.
- `--staged`: Explicitly trigger staged detection (active by default for `generate`).

#### 💡 CLI Usage Examples

**1. Generate tests for Git staged files (Automated):**

```bash
npx ts-genai-test generate
```

**2. Manually generate tests for a specific folder:**

```bash
npx ts-genai-test run --path src/services/userAuth
```

**3. Target only one specific function in a file:**

```bash
npx ts-genai-test run --path src/utils/helper.ts --function computeComplexity
```

**4. Force regeneration of existing tests:**

```bash
npx ts-genai-test run --path src/components --override
```

---

## ♻️ Override Test Case Option

By default, the tool does NOT overwrite existing test files to prevent accidental data loss.
You can explicitly allow regeneration of test cases using the override option:

```Typescript
await generateTests(inputPrompt, { override: true });
```

> [!IMPORTANT]
> **API Migration Notice:** The second argument of `generateTests` has been upgraded from a simple `boolean` to an `ExecutionContext` object to support advanced metadata. While I currently maintain backward compatibility for boolean inputs, this will be removed in future major versions. I highly recommend migrating your scripts to use the object syntax or switching to the new CLI commands.

## Behavior Summary

| Scenario                            | Result                  |
| ----------------------------------- | ----------------------- |
| Test file exists & override = false | ❌ Skips generation     |
| Test file exists & override = true  | ✅ Overwrites test file |
| Test file does not exist            | ✅ Creates test file    |

This makes the tool safe for:

- CI pipelines
- Iterative development
- Controlled regeneration of tests

## 📊 Test Metrics & History

The tool tracks execution data to help you audit cost and reliability. This log is stored entirely locally.

- **Location:** `.ts-genai-test/test-summary.json`
- **History Limit:** Last 50 runs.
- **Tracked data:** Function name, Source file path, Pass/Fail count, Model identity, Token usage (Input/Output), Success Rate, Execution time, and Code Coverage.

## 🔁 GenAI Retry Strategy

To improve reliability, the system automatically retries **twice (3 total attempts)** if a GenAI request fails due to:

- Network instability
- API rate limits (HTTP 429)
- Overloaded provider servers (HTTP 502/503)

If the retry sequence fails, a clear error message is securely thrown avoiding half-baked test case rendering.

✔️ Prevents duplicate test creation
✔️ Improves success rate
✔️ Keeps execution deterministic

## 🧠 Core Functionality

### 1. Advanced Input & Complexity Analysis

- ✔ **Recursive Directory Scanning**: Resolves all `.ts` files within a target path automatically.
- ✔ **AST Analysis**: Parses code to compute complexity scores based on LOC, branching, and async usage.
- ✔ **Intelligent Routing**: Dynamically selects between Gemini, OpenAI, and Groq based on complexity vs. cost.
- ✔ **Function Isolation**: Specifically target one function using the `--function` flag.

### 2. AI Test Case Generation

- ✔ **Exhaustive Prompting**: Generates sophisticated prompts providing full implementation context.
- ✔ **Context-Aware Imports**: Detects export styles (default vs. named) to write correct test file imports.
- ✔ **Jest-Strict Output**: Produces ready-to-run `.test.ts` files using modern Jest matchers.
- 🔁 **Resilient Execution**: Multi-retry logic to handle provider downtime or rate limits.

### 3. Performance & Architecture

- ✔ **Grouped AI Units**: Consolidates functions from the same file into a single unit to save costs and tokens.
- ✔ **Shared Iterator Workers**: High-performance $O(1)$ task queue for concurrent processing without array-reindexing bottlenecks.
- ✔ **Batched Persistence**: Aggregates all test summaries into a single secure I/O write.
- ✔ **Token Tracking**: Full audit of input and output tokens for cost calculation.
- ✔ **Coverage Mapping**: Extracts Jest coverage data automatically to map test success rates.
- ✔ **Local History**: Persists the last 50 runs for offline auditing and performance review.

### 4. Import & Framing Intelligence

- ✔ **Mixed Export Framing**: Detects and handles files with both `default` and `named` exports using an AST-ready framing engine.
- ✔ **Context-Aware Imports**: Correctly frames `import Default, { Named } from '...'` syntax for grouped batches.

### 🧪 Supported Test Frameworks

| Framework | Status       |
| --------- | ------------ |
| Jest      | ✅ Supported |
| Mocha     | ⏳ Planned   |
| Vitest    | ⏳ Planned   |

### 🧠 Supported AI Providers

| Provider   | Status     |
| ---------- | ---------- |
| OpenAI GPT | ✅         |
| Gemini     | ✅         |
| Groq       | ✅         |
| Others     | ⏳ Planned |

## 🛣️ Feature Roadmap

- ✅ Recursive directory scanning (Manual Run)
- ✅ Function-specific isolation (--function)
- ✅ AST-based Complexity Analysis
- ✅ Dynamic LLM Provider selection
- ✅ Batch performance optimized metrics saving
- ✅ Git pre-commit automated integration
- ✅ Configurable AI model selection (Groq, OpenAI, Gemini, etc.)
- ✅ Configurable output paths and test file names
- ⏳ Support for Vitest and Mocha
- ⏳ Non-TypeScript (JS) support
- ⏳ Automated Mock data generation engine

## ⚠️ Limitations

- **Human Review Required**: AI-generated tests should always be reviewed by a developer to ensure logical intent matches the business requirement.
- **Single-File Context**: Currently, the AST analyzer only sees the code within the target file. It does not resolve logic from external imported files.
- **TypeScript Only**: Support is currently limited to `.ts` files. JavaScript (`.js`) and other languages are on the roadmap.
- **Provider Rate Limits**: The tool is subject to the rate limits of your configured LLM provider (OpenAI, Gemini, etc.).
- **Complex Edge Cases**: Highly abstract or complex generic patterns in TypeScript may require manual test adjustments.

## 🎓 Collaboration & Research

I'm actively seeking collaboration with **Academic Researchers**, **PhD Scholars**, and **Software Engineering Labs** (IISc, IITs, CMU, etc.) to push the boundaries of AI-driven software verification. Our architecture is designed as a platform for research in:

- **Static Analysis + LLM Hybrid Systems**
- **Cost-Optimized AI Orchestration**
- **Autonomous Mock Data Generation**

📄 **[View the Research Collaboration Proposal](./docs/collaboration_proposal.md)**

If you are a professor or researcher interested in using `ts-genai-test` as a base for your studies, please reach out via GitHub Issues or LinkedIn.

## 🤝 Acknowledgements

This project was developed with a high-velocity, co-engineering approach, combining human architectural vision with AI pair-programming to deliver robust, state-of-the-art tooling.

- **Architect & Lead Developer:** [Srinidhi Anand](mailto:srinidhianand4@gmail.com) | [GitHub Profile](https://github.com/srinidhi-anand)
- **Technical Implementation Partner:** Antigravity (Advanced AI Coding Assistant)

## 📄 License

MIT © Srinidhi Anand
