import { OpenAI } from "openai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import logger from "../../config/logger";
import { GenerateContentResponse } from "@google/genai";
import { models, modelsPricing } from "./pricingConfig";
import { config } from "../../config/config";
import { JestSummary, PromptInput } from "../../types/functionalPromptType";

export class MetricsRunner {
    model: models = null;

    inputTokens = 0;

    outputTokens = 0;

    coverage = 0;

    costPerFunction = 0;

    costPerTest = 0;

    numOfTcs = 12;

    inputDetails: PromptInput | null = null;

    constructor() {
        logger.info(`MetricsRunner Started.`);
        this.model = config.model.name as models
    }

    parseIOTokens(response: OpenAI.Chat.Completions.ChatCompletion | GenerateContentResponse) {
        if (response instanceof GenerateContentResponse && response?.usageMetadata) {
            this.inputTokens = (response?.usageMetadata?.promptTokenCount || 0) + (response?.usageMetadata?.toolUsePromptTokenCount || 0);
            this.outputTokens = (response?.usageMetadata?.candidatesTokenCount || 0) + (response?.usageMetadata?.thoughtsTokenCount || 0);
        } else if (response && (response as OpenAI.Chat.Completions.ChatCompletion)?.usage) {
            this.inputTokens = (response as OpenAI.Chat.Completions.ChatCompletion)?.usage?.prompt_tokens || 0;
            this.outputTokens = (response as OpenAI.Chat.Completions.ChatCompletion)?.usage?.completion_tokens || 0;
        }
    }

    // cost per LLM call (per function)
    calculateCostPerFunction() {
        if (!this.model) {
            this.costPerFunction = 0;
            return this.costPerFunction;
        }

        const pricing = modelsPricing[this.model];
        this.costPerFunction = (this.inputTokens * pricing.inputCostPerToken) + (this.outputTokens * pricing.outputCostPerToken);
        return this.costPerFunction;
    }

    calculateTokenEfficiency() {
        return this.coverage / (this.inputTokens + this.outputTokens);
    }

    calculateCostPerTest() {
        this.costPerTest = this.costPerFunction / this.numOfTcs;
        return this.costPerTest;
    }

    calculateCostPerCoverage() {
        return this.coverage / this.costPerFunction
    }

    calculateCoverage(rootDir: string) {
        const summaryPath = `${rootDir}/coverage/coverage-summary.json`
        if (!fs.existsSync(summaryPath)) {
            throw new Error("coverage-summary.json not found");
        }
        const summary = JSON.parse(
            fs.readFileSync(summaryPath, "utf-8")
        );

        const c = summary.total;

        const coveragePercent =
            0.4 * c.branches.pct +
            0.3 * c.lines.pct +
            0.2 * c.statements.pct +
            0.1 * c.functions.pct;

        return {
            coverage: {
                line: summary.total.lines.pct,
                branch: summary.total.branches.pct,
                function: summary.total.functions.pct,
                statements: summary.total.statements.pct
            },
            coveragePercent,
        }
    }

    hasJest(rootDir: string): boolean {
        try {
            execSync("npx jest --version", { cwd: rootDir, stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }

    findJestConfig(rootDir: string): string | null {
        const possibleConfigs = [
            "jest.config.js",
            "jest.config.ts",
            "jest.config.cjs",
            "jest.config.mjs",
            "package.json",
        ];

        for (const file of possibleConfigs) {
            const fullPath = path.join(rootDir, file);

            if (fs.existsSync(fullPath)) {
                if (file === "package.json") {
                    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
                    if (pkg.jest) return fullPath;
                } else {
                    return fullPath;
                }
            }
        }

        return null;
    }

    parseJestResults(resultsPath: string) {
        if (!fs.existsSync(resultsPath)) {
            throw new Error("jest-results.json not found");
        }

        const data = JSON.parse(
            fs.readFileSync(resultsPath, "utf-8")
        );
        return data;
    }

    async runJestForFile(rootDir: string, funcName: string): Promise<JestSummary> {

        if (!this.hasJest(rootDir)) {
            throw new Error("Jest is not installed in this project.");
        }

        const jestConfig = this.findJestConfig(rootDir);
        const outputFile = path.join(rootDir, "jest-results.json");
        logger.warn(`Jest config:", ${jestConfig || "Not found (using default)"}`);

        const command = [
            "npx jest",
            "--coverage",
            "--json",
            `--outputFile=${outputFile}`,
            "--coverageReporters=json-summary",
            "--passWithNoTests",
        ].join(" ");

        logger.info(`Running Jest:", ${command}`);

        const start = performance.now();

        try {
            execSync(command, {
                cwd: rootDir,
                stdio: "inherit",
            });
        } catch (err) {
            logger.warn("Jest completed with errors (continuing)");
        }

        const end = performance.now();
        logger.info(`parsing ${outputFile} to read jest results.`);
        const res = this.parseJestResults(outputFile);
        logger.info(`parsed ${outputFile} and fetched jest results.`);
        fs.unlinkSync(outputFile);
        logger.info(`removed ${outputFile} to cleanup the space.`);
        const coverage = this.calculateCoverage(rootDir);
        this.coverage = coverage.coveragePercent;
        return {
            functionName: funcName,
            passedTests: res.numPassedTests,
            failedTests: res.numFailedTests,
            totalTests: res.numTotalTests,
            llm: this.model || '',
            sourceFilePath: this.inputDetails?.filePath || '',
            tokens: {
                input: this.inputTokens,
                output: this.outputTokens
            },
            cost: this.calculateCostPerFunction(),
            successRate:
                res.numTotalTests === 0
                    ? 0
                    : (res.numPassedTests / res.numTotalTests) * 100,
            executionTimeMs: end - start,
            ...coverage,
        };
    }
}
