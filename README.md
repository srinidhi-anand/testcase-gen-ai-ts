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

- Generate Jest unit tests automatically from a typescript function
- Works with server-side Node.js + TypeScript projects
- Configurable AI model support (Gemini, Groq, OpenAI GPT, etc.)
- Strict output format (valid `.test.ts` test files)
- Easy to integrate into existing development workflows
- Creates test folders automatically if missing
- Built with **pnpm** (v10.24.0)
- Built-in **one-time retry mechanism** for GenAI calls if the initial request fails.

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

## 🔁 GenAI Retry Strategy

To improve reliability, the system automatically retries once if a GenAI request fails due to:

- network issues
- API rate limits
- transient LLM errors

If the retry fails, a clear error message is returned

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

- ⏳ Read and process all files in src folder
- ⏳ Generate test cases for every function in a file
- ✅ AI-based Jest test generation
- ✅ Automatic test folder creation
- ✅ Predictable test file naming
- ⏳ Support for additional test frameworks
- ⏳ Support for non-TypeScript files
- ⏳ API and functional test generation
- ✅ Configurable AI model selection (Groq, OpenAI, Gemini, etc.)
- ✅ Configurable output paths and test file names

## ⚠️ Limitations

- Generated test cases should be reviewed before production use
- Complex business logic may require manual adjustments
- This tool assists developers; it does not replace human-written tests

## 📄 License

MIT © Srinidhi Anand
