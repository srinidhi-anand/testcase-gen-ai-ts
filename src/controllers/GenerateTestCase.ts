import path from "path";
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
  if (!inputPromptDetails || inputPromptDetails.length === 0) {
    throw new Error("inputPromptDetails array is required");
  }

  for (const inputPrompt of inputPromptDetails) {
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
      if (inputPrompt && !inputPrompt.rootPath) {
        // checks for the project root path information.
        throw new Error(
          "rootPath is required as outputTestDir is not provided"
        );
      }
      inputPrompt.outputTestDir = path.resolve(
        inputPrompt.rootPath as string,
        "tests"
      );
    }

    // if no test file name is provided, generate it based on function name
    // else use the provided test file name
    if (!inputPrompt.testFileName) {
      inputPrompt.testFileName = fileNameFramer(inputPrompt);
    }
    // validate test file if it exists else create it
    const validateTestFlow = validateTestFile(
      inputPrompt.outputTestDir as string,
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
      inputPrompt.outputTestDir as string,
      inputPrompt.testFileName,
      aiResponse
    );
    if (result) {
      logger.info("Test files written successfully.");
    }
  }
};
