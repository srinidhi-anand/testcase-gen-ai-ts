import type { PromptInput } from "../types/functionalPromptType";
import Path from "path";

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
