import Path from "path";
import fs from "fs";
import logger from "../../config/logger";
import type { PromptInput } from "../../types/functionalPromptType";

/**
 * Generate file name for test case based on input prompt details
 * @param {PromptInput} inputPromptDetails Input prompt details
 * @returns {string} Generated test case file name with .test.ts extension.
 */
export const fileNameFramer = (inputPromptDetails: PromptInput): string => {
  const { folderPath, functionName, filePath } = inputPromptDetails;

  const fileName = Path.join(
    Path.basename(folderPath),
    Path.parse(filePath).name,
    `${functionName}.test.ts`
  );

  return fileName;
};

export function defineModuleImport(functionName: string, importPath: string, isDefaultExport = false) {
  let importLine = '';
  if (isDefaultExport) {
    logger.info(`import style follows default function syntax`);
    importLine = `import ${functionName} from "${importPath}";`;
  } else {
    logger.info(`import style follows named function syntax`);
    importLine = `import { ${functionName} } from "${importPath}";`;
  }
  return importLine
}

export function getImportPath(inputPromptDetail: PromptInput) {
  const { filePath, outputTestDir = '', testFileName = '', isDefaultExport, functionName } = inputPromptDetail;
  const absTest = Path.resolve(outputTestDir, testFileName);

  let relative = Path.relative(
    Path.dirname(absTest),
    filePath
  );

  // remove extension
  relative = relative.replace(/\.(ts|js)$/, "");

  // ensure ./ prefix
  if (!relative.startsWith(".")) {
    relative = "./" + relative;
  }

  relative = relative.replace(/\\/g, '/');
  inputPromptDetail.importPath = relative
  inputPromptDetail.moduleSyntax = defineModuleImport(functionName, relative, isDefaultExport);

  return inputPromptDetail;
}

/**
 * Validate test file
 * @param {string} outputTestDir Output directory
 * @param {string} fileName File name
 * @param {boolean} overrideTestCase Override test case
 * @returns {boolean} True if the test file is valid, otherwise false if exists.
 */
export const validateTestFile = (
  outputTestDir: string,
  fileName: string,
  overrideTestCase = false
) => {
  const filePath = Path.join(outputTestDir, fileName);
  logger.info(
    `File path ${filePath} with overrideTestCase ${overrideTestCase}`
  );
  // validate file exists in the output directory.
  if (fs.existsSync(filePath) && !overrideTestCase) {
    logger.error(`Test file ${filePath} already exists.`);
    throw new Error(`Test file ${filePath} already exists.`);
  }
  // Extract the directory portion from the full path
  const dir = Path.dirname(filePath);
  logger.info(`Directory path ${dir}`);

  // Create the directory recursively
  // This won't throw an error if the directory already exists
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Directory exists ${fs.existsSync(dir)}; filePath ${filePath}`);

  return true;
};
