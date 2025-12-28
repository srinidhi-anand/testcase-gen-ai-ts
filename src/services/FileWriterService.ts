import fs from "fs";
import path from "path";
import logger from "../config/logger";

/**
 * Write test files to the output directory
 * @param {string} outputDir Output directory
 * @param {string} fileName File name
 * @param {string} llmResponse LLM response
 */
export const writeTestFiles = (
  outputDir: string,
  fileName: string,
  llmResponse: string
) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // llm response is parsed with removing unwanted characters
  let content = llmResponse
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "")
    .trim();

  logger.info(`Writing test file ${fileName}`);
  const filePath = path.join(outputDir, fileName);
  logger.info(`File path ${filePath}`);
  // Extract the directory portion from the full path
  const dir = path.dirname(filePath);
  logger.info(`Directory path ${dir}`);

  // Create the directory recursively
  // This won't throw an error if the directory already exists
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Directory exists ${fs.existsSync(dir)}; filePath ${filePath}`);
  // write file to the output directory with llm content.
  fs.writeFileSync(filePath, content, "utf-8");
  logger.info(`Test file ${filePath} written successfully.`);
};
