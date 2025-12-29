import { generateTests } from "../src/controllers/GenerateTestCase";

describe("generateTestCases", () => {
  it("should throw an error if inputPromptDetails array is not provided", async () => {
    await expect(generateTests([])).rejects.toThrow(
      "inputPromptDetails array is required"
    );
  });
  it("should throw an error if folderPath is not provided", async () => {
    await expect(
      generateTests([
        {
          filePath: "test",
          folderPath: "",
          functionName: "test",
          outDir: "test",
        },
      ])
    ).rejects.toThrow("folderPath is required");
  });
  it("should throw an error if filePath is not provided", async () => {
    await expect(
      generateTests([
        {
          filePath: "",
          folderPath: "test",
          functionName: "test",
          outDir: "test",
        },
      ])
    ).rejects.toThrow("filePath is required");
  });
  it("should throw an error if functionName is not provided", async () => {
    await expect(
      generateTests([
        {
          filePath: "test",
          folderPath: "test",
          functionName: "",
          outDir: "test",
        },
      ])
    ).rejects.toThrow("functionName is required");
  });
  it("should throw an error if outDir is not provided", async () => {
    await expect(
      generateTests([
        {
          filePath: "test",
          folderPath: "test",
          functionName: "test",
          outDir: "",
        },
      ])
    ).rejects.toThrow("outDir is required");
  });
});
