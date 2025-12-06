# testcase-gen-ai-ts
📘 AI-Powered Jest Test Case Generator for TypeScript (Node.js)

A guide to building an AI-powered Test Case Generator for TypeScript (Node.js) backend functions — outputting Jest tests — with support for switching between different LLMs (e.g. Gemini, GPT, etc.), and guidance on which model might fit your use-case best.

🚀 Features

* Given a function name or TypeScript code, generate unit tests in Jest automatically.
* Supports server-side Node.js + TypeScript projects.
* Configurable to use different LLM backends (e.g. Gemini, OpenAI GPT).
* Easy to integrate in development workflow.
* Strict output format (valid .ts test file), ready to drop into your test suite.

Project built on pnpm v10.24.0

## Installation

```bash
pnpm install
```

## Build

```bash
pnpm run build
```

## Usage

```bash
pnpm run dev
```

## License
Apache License 2.0

## feature roadmap

- ✅ Read the files in src folder.
- ✅ Generate test case for each function in a file.
- ✅ Based on AI model selection, generate test case to a test file under tests suite folder.
- ✅ Tests folder will be created in the root directory if not exists already.
- ✅ Test file name creation will be based on the function name.
- ✅ Test case generation will be using on jest.
- ❌ Extended support for other test frameworks.
- ❌ Extended support for other files other than typescript.
- ❌ Extended support for API test cases including Functional test cases.
- ✅ AI model selection will be configurable.
- ❌ Function name and file path will be provided as input to the AI model to generate test case.
