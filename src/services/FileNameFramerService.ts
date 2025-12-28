import Path from "path";
import fs from "fs";
import logger from "../config/logger";
import type { PromptInput } from "../types/functionalPromptType";

/**
 * Generate file name for test case based on input prompt details
 * @param {PromptInput} inputPromptDetails Input prompt details
 * @returns {string} Generated test case file name with .test.ts extension.
 */
export const fileNameFramer = (inputPromptDetails: PromptInput): string => {
  const fileName = Path.join(
    Path.basename(inputPromptDetails.folderPath),
    Path.parse(inputPromptDetails.filePath).name,
    `${inputPromptDetails.functionName}.test.ts`
  );

  return fileName;
};

/**
 * Validate test file
 * @param {string} outputDir Output directory
 * @param {string} fileName File name
 * @param {boolean} overrideTestCase Override test case
 * @returns {boolean} True if the test file is valid, otherwise false if exists.
 */
export const validateTestFile = (
  outputDir: string,
  fileName: string,
  overrideTestCase = false
) => {
  const filePath = Path.join(outputDir, fileName);
  logger.info(`File path ${filePath}`);
  // Extract the directory portion from the full path
  const dir = Path.dirname(filePath);
  logger.info(`Directory path ${dir}`);

  // Create the directory recursively
  // This won't throw an error if the directory already exists
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Directory exists ${fs.existsSync(dir)}; filePath ${filePath}`);
  // write file to the output directory with llm content.
  if (fs.existsSync(filePath) && !overrideTestCase) {
    logger.warn(`Test file ${filePath} already exists.`);
    return false;
  }
  return true;
};
