import path from "path";
import {
  fileNameFramer,
  getImportPath,
  validateTestFile,
} from "../services/outputService/FileNameFramerService";
import type { ExecutionContext, PromptInput } from "../types/functionalPromptType";
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
  if (typeof ctx === 'boolean') {
    logger.warn("DEPRECATION [ts-genai-test]: Passing an override state as boolean to 'generateTests' is deprecated. Please pass an object instead, e.g., { override: true }. Support for boolean arguments will be removed in future versions.");
    overrideTestCase = ctx;
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

  logger.info(`generateTests: generating test for ${inputDetails.length} file(s).`)
  logger.info(`generateTests: generating test override enabled ? ${!!overrideTestCase}`)

  const testFilePaths = [];
  const summariesBatch = [];

  const metricsService = new MetricsRunner();

  for (let inputPrompt of inputDetails) {
    logger.info(`inputPromptDetails : ${JSON.stringify(inputPrompt)}`);

    if (inputPrompt && !inputPrompt.folderPath) {
      throw new Error("folderPath is required");
    }

    if (inputPrompt && !inputPrompt.filePath) {
      throw new Error("filePath is required");
    }

    if (inputPrompt && !inputPrompt.functionName) {
      throw new Error("functionName is required");
    }

    if (inputPrompt && !inputPrompt.outputTestDir) {
      logger.warn(
        "outputTestDir is not provided, hence using default value 'tests' folder"
      );
      inputPrompt.outputTestDir = path.resolve(
        inputPrompt.rootPath as string,
        "tests"
      );
    }

    if (inputPrompt && !inputPrompt.rootPath) {
      // checks for the project root path information.
      logger.warn(
        "rootPath is missing and hence resolving to end user project root path"
      );
      inputPrompt.rootPath = process.cwd();
    }

    // if no test file name is provided, generate it based on function name
    // else use the provided test file name
    if (!inputPrompt.testFileName) {
      inputPrompt.testFileName = fileNameFramer(inputPrompt);
    }

    inputPrompt = getImportPath(inputPrompt);
    const { testFileName = '', rootPath = '', functionName, outputTestDir, } = inputPrompt;

    // validate test file if it exists else create it
    const validateTestFlow = validateTestFile(
      outputTestDir as string,
      testFileName,
      overrideTestCase
    );
    if (!validateTestFlow) {
      logger.info(`Test file ${testFileName} already exists.`);
      continue;
    }
    logger.info(`Creating prompt for test file ${testFileName}`);
    const prompt = buildPrompt(inputPrompt);
    logger.info(`Prompt generated`);

    let sourceCode = prompt;
    try {
      const actualPath = inputPrompt.filePath.endsWith('.ts') ? inputPrompt.filePath : `${inputPrompt.filePath}.ts`;
      if (fs.existsSync(actualPath)) {
        sourceCode = fs.readFileSync(actualPath, "utf-8");
      }
    } catch (e) { }

    const complexityOutput = computeComplexity(sourceCode);
    const aiDecision = aiModelDecider(complexityOutput.complexityScore);

    if (aiDecision.suggestionFlag) {
      logger.info(aiDecision.suggestionFlag);
    }

    // dynamically override the metrics tracked model for precise token pricing!
    metricsService.model = aiDecision.resolvedModel as models;
    metricsService.inputDetails = inputPrompt;

    const aiResponse = await initAIModel(aiDecision.llmProvider, prompt, aiDecision.resolvedModel, metricsService);
    logger.info(`AI response generated from computed model provider: ${aiDecision.resolvedModel}`);
    const resultPath = writeTestFiles(
      outputTestDir as string,
      testFileName,
      aiResponse
    );
    if (resultPath) {
      logger.info("Test files written successfully.");
      testFilePaths.push(resultPath); // result holds the test file path.
      const summary = await metricsService.runJestForFile(rootPath, functionName);
      summariesBatch.push(summary);
    }
  }

  // After loop cleanly aggregates, sync everything mapping cleanly 1 single time securely.
  if (summariesBatch.length > 0) {
    saveRunSummary(inputDetails[0]?.rootPath as string || process.cwd(), summariesBatch);
    logger.info(`Test files summarized securely tracking latest execution cases!`);
  }
};
