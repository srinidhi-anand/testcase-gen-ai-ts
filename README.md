# **testcase-gen-ai-ts**

📘 AI-Powered Jest Test Case Generator for TypeScript (Node.js)

A guide to building an AI-powered Test Case Generator for TypeScript (Node.js) backend functions — outputting Jest tests — with support for switching between different LLMs (e.g. Gemini, GPT, etc.), and guidance on which model might fit your use-case best.

🚀 Features

- Given a function name or TypeScript code, generate unit tests in Jest automatically.
- Supports server-side Node.js + TypeScript projects.
- Configurable to use different LLM backends (e.g. Gemini, Groq, OpenAI GPT).
- Easy to integrate in development workflow.
- Strict output format (valid .ts test file), ready to drop into your test suite.

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

- ⏳ Read the files in src folder.
- ⏳ Generate test case for each function in a file.
- ✅ Based on AI model selection, generate test case to a test file under tests suite folder.
- ✅ Tests folder will be created in the root directory if not exists already.
- ✅ Test file name creation will be based on the input prompt details like function, file path, etc.
- ✅ Test case generation will be using jest.
- ⏳ Extended support for other test frameworks.
- ⏳ Extended support for other files other than typescript.
- ⏳ Extended support for API test cases including Functional test cases.
- ✅ AI model selection will be configurable such as groq, openai, gemini, etc.
- ✅ Function name and file path will be provided as input to the AI model to generate test case.

## **Core Functionality (Middle)**

## Goal: Conceptual Steps - Implement the main logic for generating test cases from user-provided code/functions.

## 2.1 Input Handling

- ✔️User submits file path, folder path and output path to store test cases.
- ✔️Validate input path exists and consists of valid files if its folder path.
- ⏳Prints the files count in the folder and number of functions per file.

## 2.2 AI Test Case Generation

- ✔️Create a service to call GenAI API with a prompt.
- ✔️Include language, function name, and expected behavior in a promp.
- ✔️Receive typescript ready code response as generated test cases (e.g., Jest code for Node.js).
- ⏳Optional: allow different testing frameworks (Jest, Mocha, Pytest).

## 2.3 Formatting & Storage

- ✔️Parse AI response to proper code format.
- ✔️Create generated test cases for user reference in the provided output path.
- ✔️Print the generated test cases statuses.
- ⏳Optional: Return the generated test cases statuses to frontend or API caller.

## 2.4 Error Handling

- ⏳Invalid code snippet or unsupported language.
- ⏳API errors (rate limit, timeout).
- ✔️Return / display the clear error messages to the user.
