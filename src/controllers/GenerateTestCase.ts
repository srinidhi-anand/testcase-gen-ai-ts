import { writeTestFiles } from "../services/FileWriterService";
import { buildPrompt } from "../services/FunctionalTestCaseService/generator";
import {
  fileNameFramer,
  validateTestFile,
} from "../services/FileNameFramerService";
import { initAIModel } from "../services/modelService/index";
import type { PromptInput } from "../types/functionalPromptType";
import logger from "../config/logger";
import { config } from "../config/config";

/**
 * Generate test cases
 * @param {PromptInput[]} inputPromptDetails Prompt input details
 */
export const generateTests = async (
  inputPromptDetails: PromptInput[],
  overrideTestCase = false
) => {
  for (const inputPrompt of inputPromptDetails) {
    logger.info(`inputPromptDetails : ${JSON.stringify(inputPrompt)}`);
    inputPrompt.testFileName = fileNameFramer(inputPrompt);
    const validateTestFlow = validateTestFile(
      inputPrompt.outDir,
      inputPrompt.testFileName,
      overrideTestCase
    );
    if (!validateTestFlow) {
      logger.info(`Test file ${inputPrompt.testFileName} already exists.`);
      continue;
    }
    logger.info(`Creating prompt for test file ${inputPrompt.testFileName}`);
    const prompt = buildPrompt(inputPrompt);
    logger.info("Prompt generated");
    const aiResponse = await initAIModel(config.model, prompt);
    logger.info(`AI response generated.`);
    const result = writeTestFiles(
      inputPrompt.outDir,
      inputPrompt.testFileName,
      aiResponse
    );
    if (result) {
      logger.info("Test files written successfully.");
    }
  }
};
