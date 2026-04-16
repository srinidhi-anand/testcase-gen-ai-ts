import fs from "fs";
import path from "path";
import logger from "../../config/logger";
import { JestSummary, SummaryHistory } from "../../types/functionalPromptType";

export const saveRunSummary = (rootPath: string, summaryPayload: JestSummary[]) => {
    try {
        const timestamp = new Date().toISOString();
        if (!fs.existsSync(path.join(rootPath || process.cwd(), ".ts-genai-test"))) {
            fs.mkdirSync(path.join(rootPath || process.cwd(), ".ts-genai-test"));
        }
        const filePath = path.join(rootPath || process.cwd(), ".ts-genai-test", `test-summary.json`);
        let history: SummaryHistory[] = [];

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8");
            try {
                history = JSON.parse(content);
                if (!Array.isArray(history)) {
                    history = [];
                }
            } catch (e) {
                history = [];
            }
        }

        const payloads = Array.isArray(summaryPayload) ? summaryPayload : [summaryPayload];

        for (const summary of payloads) {
            history.push({
                functionName: summary.functionName,
                sourceFile: summary.sourceFilePath,
                passedTests: summary.passedTests,
                failedTests: summary.failedTests,
                totalTests: summary.totalTests,
                llm: summary.llm,
                successRate: summary.successRate,
                executionTimeMs: summary.executionTimeMs,
                coveragePercent: summary.coveragePercent,
                timestamp: timestamp
            });
        }

        // Limit to last 50 objects protecting against mega-scans wiping older context logs
        if (history.length > 50) {
            history = history.slice(-50);
        }

        fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf-8");
        logger.info(`History got successfully updated with latest run on path: ${filePath}`);
    } catch (error) {
        logger.error("Error saving test summary:", error);
    }
};
