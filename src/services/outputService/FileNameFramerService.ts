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
  const { folderPath, filePath } = inputPromptDetails;

  const sourceFileName = Path.parse(filePath).name;

  const fileName = Path.join(
    Path.basename(folderPath),
    `${sourceFileName}.test.ts`
  );

  return fileName;
};

export function defineModuleImport(
  functions: string[],
  importPath: string,
  exportMapping: Record<string, boolean> // Mapping of function name -> isDefault
) {
  const defaultExport = functions.find(f => exportMapping[f] === true);
  const namedExports = functions.filter(f => exportMapping[f] === false);

  let importLine = 'import ';
  if (defaultExport && namedExports.length > 0) {
    importLine += `${defaultExport}, { ${namedExports.join(", ")} }`;
  } else if (defaultExport) {
    importLine += defaultExport;
  } else if (namedExports.length > 0) {
    importLine += `{ ${namedExports.join(", ")} }`;
  }

  importLine += ` from "${importPath}";`;
  return importLine;
}

export function getImportPath(inputPromptDetail: PromptInput) {
  const {
    filePath,
    outputTestDir = '',
    testFileName = '',
    functions = [],
    exportMapping = {},
  } = inputPromptDetail;


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
  inputPromptDetail.importPath = relative;
  inputPromptDetail.moduleSyntax = defineModuleImport(
    functions,
    relative,
    exportMapping
  );

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
