// interface for functional prompt type
export interface PromptInput {
  folderPath: string;
  filePath: string;
  functionName: string;
  outputTestDir?: string;
  testFileName?: string;
  rootPath?: string;
}
