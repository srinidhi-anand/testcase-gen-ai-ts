import type { PromptInput } from "../../types/functionalPromptType";
import { promptTemplate } from "./prompt";

/**
 * Build prompt for functional test case generation
 * @param {PromptInput} input Prompt input details
 * @returns {string} Prompt
 */
export const buildPrompt = (input: PromptInput): string => {
  return promptTemplate(
    input.folderPath,
    input.filePath ?? "",
    input.functionName ?? "",
    input.outDir ?? "",
    input.testFileName ?? "",
    input.loggerFilePath
  );
};
