import path from "path";
import {
  fileNameFramer,
  getImportPath,
  validateTestFile,
} from "../services/outputService/FileNameFramerService";
import type { ExecutionContext, JestSummary, PromptInput } from "../types/functionalPromptType";
import logger from "../config/logger";
import { initAIModel } from "../services/modelService/index";
import { MetricsRunner } from "../services/metrics/metricsRunner";
import { writeTestFiles } from "../services/outputService/FileWriterService";
import { buildPrompt } from "../services/FunctionalTestCaseService/generator";
import { saveRunSummary } from "../services/outputService/SummaryStorageService";
import { computeComplexity, aiModelDecider } from "../services/FunctionalTestCaseService/computeComplexity";
import * as fs from "fs";
import { config } from "../config/config";
import { models } from "../services/metrics/pricingConfig";
import { extractFunctions } from "./dataController";

/**
 * Generate test cases
 * @param {PromptInput[]} inputPromptDetails Prompt input details
 */
export const generateTests = async (
  inputDetails: PromptInput[],
  ctx?: ExecutionContext | boolean,
) => {
  // override always defaults to false, supports both legacy boolean arg and new ctx object metadata!
  let overrideTestCase = false;
  let legacy = false;
  if (typeof ctx === 'boolean') {
    logger.warn("DEPRECATION [ts-genai-test]: Passing an override state as boolean to 'generateTests' is deprecated. Please pass an object instead, e.g., { override: true }. Support for boolean arguments will be removed in future versions.");
    overrideTestCase = ctx;
    legacy = true;
  } else if (ctx && typeof ctx === 'object') {
    overrideTestCase = !!ctx.override;
  }
  if (!inputDetails || inputDetails.length === 0) {
    throw new Error("inputPromptDetails array is required");
  }

  // Early-exit validation: Prevent expensive AST operations if the user forgot their API token
  if (!config.model.apiKey) {
    logger.error("CRITICAL: No AI API Key was detected in the environment configurations.");
    throw new Error("AI API Key is missing! Please configure AI_API_KEY (or your specific provider's token) in your .env file before running ts-genai-test.");
  }

  if ((!config.model.name && config.general.llm) || (!config.general.llm && config.model.name)) {
    logger.error("CRITICAL: Invalid LLM or Model Name was detected in the environment configurations.");
    throw new Error(`${config.model.name ? 'LLM' : 'MODEL'} is missing! Please configure ${config.model.name ? 'LLM' : 'MODEL'} in your .env file before running ts-genai-test.`);
  }

  logger.info(`generateTests: analyzing ${inputDetails.length} target function(s).`)
  logger.info(`generateTests: generating test override enabled ? ${!!overrideTestCase}`)

  // 1. Validation
  for (const inputPrompt of inputDetails) {
    if (!inputPrompt.folderPath) throw new Error("folderPath is required");
    if (!inputPrompt.filePath) throw new Error("filePath is required");
    if (!inputPrompt.functionName) throw new Error("functionName is required");
  }

  const testFilePaths: string[] = [];
  const summariesBatch: JestSummary[] = [];
  const CONCURRENCY_LIMIT = 3;

  // 2. Group inputs by filePath to minimize AI requests
  const fileGroups = new Map<string, PromptInput[]>();
  for (const input of inputDetails) {
    const key = input.filePath;
    if (!fileGroups.has(key)) {
      fileGroups.set(key, []);
    }
    fileGroups.get(key)!.push(input);
  }

  logger.info(`Grouping complete: Consolidated into ${fileGroups.size} AI unit(s) (one per unique file).`);

  // 3. Process each file group as a single AI task
  const processFileGroup = async (filePath: string, inputs: PromptInput[]) => {
    const metricsService = new MetricsRunner();
    // Use the first input as the base for shared metadata
    const baseInput: PromptInput = { ...inputs[0] } as PromptInput;
    let defaultExports = inputs.reduce((acc, item) => {
      acc[item.functionName] = !!item.isDefaultExport;
      return acc;
    }, {} as Record<string, boolean>)
    if (legacy) {
      // Robustly resolve filePath with proper extension (.ts or .tsx)
      let resolvedPath = path.resolve(baseInput.rootPath || process.cwd(), baseInput.filePath);

      // checks if filePath is missing extension, if so, resolve with proper extension.
      if (!fs.existsSync(resolvedPath)) {
        if (fs.existsSync(`${resolvedPath}.ts`)) {
          resolvedPath = `${resolvedPath}.ts`;
        }
      }

      baseInput.filePath = resolvedPath;
      const basefunctions = extractFunctions(baseInput.filePath);
      defaultExports = basefunctions.reduce((acc, item) => {
        acc[item.name] = !!item.isDefaultExport;
        return acc;
      }, defaultExports as Record<string, boolean>)
    }
    const functionNames = inputs.map(i => i.functionName);

    // Convert to multi-function input
    baseInput.functions = functionNames;
    baseInput.defaultExportName = defaultExports as Record<string, boolean>;

    logger.info(`Processing group: ${filePath} [Functions: ${functionNames.join(', ')}]`);

    try {
      // Default path resolutions
      if (!baseInput.outputTestDir) {
        baseInput.outputTestDir = path.resolve(baseInput.rootPath || process.cwd(), "tests");
      }
      if (!baseInput.rootPath) {
        baseInput.rootPath = process.cwd();
      }

      // Prepare file naming and imports for the group
      if (!baseInput.testFileName) {
        baseInput.testFileName = fileNameFramer(baseInput);
      }
      const aggregatedInput = getImportPath(baseInput);

      const { testFileName = '', rootPath = '', outputTestDir } = aggregatedInput;

      // 3. Guard: Validate if test already exists
      const canProceed = validateTestFile(outputTestDir as string, testFileName, overrideTestCase);
      if (!canProceed) return;

      // 4. Complexity Analysis (Analyze full file once)
      const prompt = buildPrompt(aggregatedInput);
      let sourceCode = prompt;
      const actualPath = filePath.endsWith('.ts') ? filePath : `${filePath}.ts`;

      if (fs.existsSync(actualPath)) {
        sourceCode = fs.readFileSync(actualPath, "utf-8");
      }

      const complexityOutput = computeComplexity(sourceCode);
      const aiDecision = aiModelDecider(complexityOutput.complexityScore);

      // 5. AI Generation for the entire group
      metricsService.model = aiDecision.resolvedModel as models;
      metricsService.inputDetails = aggregatedInput;

      logger.info(`Requesting batch test generation for: ${functionNames.join(', ')} using [${aiDecision.resolvedModel}]`);
      const aiResponse = await initAIModel(
        aiDecision.llmProvider,
        prompt,
        aiDecision.resolvedModel,
        metricsService
      );

      // 6. Write the unified test file
      const resultPath = writeTestFiles(outputTestDir as string, testFileName, aiResponse);

      if (resultPath) {
        testFilePaths.push(resultPath);
        // 7. Metrics Analysis (Run Jest once for the group)
        const summary = await metricsService.runJestForFile(rootPath, functionNames.join(', '));
        summariesBatch.push(summary);
      }
    } catch (error) {
      logger.error(`Failed to process file group ${filePath}:`, error);
    }
  };

  // 4. Concurrency-limited execution using a shared iterator for O(1) efficiency
  const iterator = fileGroups.entries();
  const workerCount = Math.min(CONCURRENCY_LIMIT, fileGroups.size);

  const workers = Array(workerCount)
    .fill(iterator)
    .map(async (iter) => {
      for (const [pathKey, group] of iter) {
        await processFileGroup(pathKey, group);
      }
    });

  await Promise.all(workers);

  // Final summary aggregation
  if (summariesBatch.length > 0) {
    saveRunSummary(inputDetails[0]?.rootPath as string || process.cwd(), summariesBatch);
    logger.info(`Optimization complete. Processed ${fileGroups.size} files and ${inputDetails.length} functions.`);
  }
};
