import { generateTests } from "../src/controllers/GenerateTestCase";
import { config } from "../src/config/config";

jest.mock("../src/config/config", () => ({
  config: {
    model: {
      apiKey: "test-api-key",
      name: "test-model"
    },
    general: {
      llm: "test-llm"
    }
  }
}));

describe("generateTestCases", () => {
  beforeEach(() => {
    config.model.apiKey = "test-api-key";
    config.model.name = "test-model";
    config.general.llm = "test-llm";
  });

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
          outputTestDir: "test",
        },
      ])
    ).rejects.toThrow("folderPath is required");
  });
  it("should throw an error if API Key is not provided", async () => {
    config.model.apiKey = '';
    await expect(
      generateTests([
        {
          filePath: "test",
          folderPath: "test",
          functionName: "test",
          outputTestDir: "test",
        },
      ])
    ).rejects.toThrow("AI API Key is missing! Please configure AI_API_KEY (or your specific provider's token) in your .env file before running ts-genai-test.");
  });
  it("should throw an error if LLM is not provided when model is provided or vice versa", async () => {
    config.model.name = '';
    await expect(
      generateTests([
        {
          filePath: "test",
          folderPath: "test",
          functionName: "test",
          outputTestDir: "test",
        },
      ])
    ).rejects.toThrow(`MODEL is missing! Please configure MODEL in your .env file before running ts-genai-test.`);
  });
  it("should throw an error if filePath is not provided", async () => {
    await expect(
      generateTests([
        {
          filePath: "",
          folderPath: "test",
          functionName: "test",
          outputTestDir: "test",
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
          outputTestDir: "test",
        },
      ])
    ).rejects.toThrow("functionName is required");
  });
});
