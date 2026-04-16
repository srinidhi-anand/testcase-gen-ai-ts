# testcase-gen-ai-ts

📘 **AI-powered Jest test case generator for TypeScript (Node.js)**

`testcase-gen-ai-ts` is a developer tool that automatically generates Jest unit test cases
for TypeScript (Node.js) backend functions using Generative AI.

It is designed to integrate smoothly into modern backend workflows and supports
multiple LLM providers (Gemini, OpenAI, Groq, etc.) with a reliable retry mechanism
to handle transient AI failures.

Built with pnpm and optimized for TypeScript-first projects.

---

## 📦 npm Package

🔗 [![npm version](https://img.shields.io/npm/v/ts-genai-test)](https://www.npmjs.com/package/ts-genai-test)

---

## 🧩 GitHub Repository

🔗 https://github.com/srinidhi-anand/testcase-gen-ai-ts

## 🚀 Features

- **Intelligent Model Selection**: Dynamically selects LLMs based on AST-based code complexity analysis.
- **Complexity-Aware Routing**: Maps complexity scores to optimal providers (`openai`, `gemini`, `groq`).
- **Manual & Automated CLI**: Supports Git staged detection (`generate`) or manual path targeting (`run`).
- **Flexible Override Policies**: Choose between `auto`, `suggest`, or `never` for AI model swaps.
- **Execution Metrics & Costs**: Tracks token usage and calculates estimated costs per test case.
- **Recursive Directory Scanning**: Scans entire module folders for TypeScript functions automatically.
- **Strict output format**: Produces valid `.test.ts` files ready for Jest.
- **History Tracking**: Local cache of the last 50 execution runs for auditing.
- **Resilient Retry Logic**: Built-in 2-retry mechanism (3 total attempts) for network failures.

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
> **Backward Compatibility:** Legacy variables (`AI_MODEL`, `AI_MODEL_NAME`) are still supported in this version but will trigger a deprecation warning in the console. We explicitly recommend migrating to the new standard above.

---

## 🚀 Usage

#### Basic Example

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

## ♻️ Override Test Case Option

By default, the tool does NOT overwrite existing test files to prevent accidental data loss.
You can explicitly allow regeneration of test cases using the override option:

```Typescript
await generateTests(inputPrompt, overrideTestCases= true);
```

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

### 1. Input Handling

- ✔ Accepts file path, folder path, and output path
- ✔ Validates input paths and file existence
- ⏳ Planned: print number of files and functions detected

### 2. AI Test Case Generation

- ✔ Generates prompts using function name
- ✔ Calls configured GenAI provider
- ✔ Produces TypeScript-ready Jest test code
- ⏳ Planned: support additional testing frameworks

### 3. Formatting & Storage

- ✔ Parses AI response into clean TypeScript code
- ✔ Automatically creates test directories if missing
- ✔ Writes generated test cases to the output path
- ✔ Displays generation status
- ⏳ Planned: return structured results for API usage

### 4. Error Handling

- ✔ Clear error messages for invalid input or AI failures
- ⏳ Planned: handle unsupported languages and malformed code
- ⏳ Planned: handle API rate limits and timeouts

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

- Generated test cases should be reviewed before production use
- Complex business logic may require manual adjustments
- This tool assists developers; it does not replace human-written tests

## 🤝 Acknowledgements

This project was developed with a high-velocity, co-engineering approach, combining human architectural vision with AI pair-programming to deliver robust, state-of-the-art tooling.

- **Architect & Lead Developer:** [Srinidhi Anand](https://github.com/srinidhi-anand)
- **Technical Implementation Partner:** Antigravity (Advanced AI Coding Assistant)

## 📄 License

MIT © Srinidhi Anand
