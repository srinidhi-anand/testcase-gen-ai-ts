// interface for functional prompt type
export interface PromptInput {
  folderPath: string;
  filePath: string;
  functions?: string[];
  functionName: string;
  outputTestDir?: string;
  testFileName?: string;
  rootPath?: string;
  isDefaultExport?: boolean;
  exportMapping?: Record<string, boolean> // Mapping of function name -> isDefault
  importPath?: string;
  moduleSyntax?: string;
}

export interface ExecutionContext {
  rootDir?: string;
  override?: boolean;
  isStaged?: boolean;
  command?: string;
  pathFilter?: string | null;
  functionFilter?: string | null;
}

export interface IFunctions {
  name: string;
  file: string;
  isDefaultExport: boolean;
  isNamedExport: boolean;
}

export interface JestSummary {
  functionName: string;
  passedTests: number;
  failedTests: number;
  totalTests: number;
  llm: string;
  sourceFilePath: string;
  tokens: {
    input: number;
    output: number;
  },
  cost: number;
  successRate: number;
  executionTimeMs: number;
  coverage: {
    line: number;
    branch: number;
    function: number;
    statements: number;
  },
  coveragePercent: number;
}

export interface SummaryHistory {
  functionName: string;
  passedTests: number;
  failedTests: number;
  totalTests: number;
  llm: string;
  sourceFile: string;
  successRate: number;
  executionTimeMs: number;
  coveragePercent: number;
  timestamp: string;
}
