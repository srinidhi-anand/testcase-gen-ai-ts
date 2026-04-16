import ts from "typescript";
import { MODEL_ADAPTER, MODEL_PREFERENCE, OVERRIDE_POLICY } from "../../config/constants";
import { AIConfig } from "../../types/modelConfigTypes";
import { config } from "../../config/config";
import logger from "../../config/logger";

function getLOC(code: string): number {
  return code.split("\n").filter((line) => line.trim() !== "").length;
}

function countBranches(code: string): number {
  const source = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  let count = 0;

  function visit(node: ts.Node) {
    if (
      ts.isIfStatement(node) ||
      ts.isSwitchStatement(node) ||
      ts.isForStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isConditionalExpression(node) // Added ternary operator
    ) {
      count++;
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return count;
}

function countAsyncWait(code: string): number {
  const source = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );
  let count = 0;
  function visit(node: ts.Node) {
    if (ts.isAwaitExpression(node)) {
      count++;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return count;
}

export function computeComplexity(code: string) {
  const lines = getLOC(code);
  const ifCount = countBranches(code);
  const asyncCalls = countAsyncWait(code);

  const LOC_weight = 0.1;
  const branch_weight = 1.5;
  const async_weight = 2.0;

  const complexityScore =
    (LOC_weight * lines) + (branch_weight * ifCount) + (async_weight * asyncCalls);
  logger.info(`Complexity Score: ${complexityScore}`);
  return { complexityScore, lines, ifCount, asyncCalls };
}

export function aiModelDecider(complexityScore: number) {
  let recommendedModel = MODEL_ADAPTER[MODEL_PREFERENCE.LOW_COST].RECOMMENDED_MODEL;
  let llmProvider = MODEL_ADAPTER[MODEL_PREFERENCE.LOW_COST].LLM_PROVIDER;
  logger.info(`preference: ${config.model.preference}`)
  if (complexityScore > 60 || config.model.preference === MODEL_PREFERENCE.HIGH_ACCURACY) {
    recommendedModel = MODEL_ADAPTER[MODEL_PREFERENCE.HIGH_ACCURACY].RECOMMENDED_MODEL;
    llmProvider = MODEL_ADAPTER[MODEL_PREFERENCE.BALANCED].LLM_PROVIDER;
  } else if (complexityScore > 25 || config.model.preference === MODEL_PREFERENCE.BALANCED) {
    recommendedModel = MODEL_ADAPTER[MODEL_PREFERENCE.BALANCED].RECOMMENDED_MODEL;
    llmProvider = MODEL_ADAPTER[MODEL_PREFERENCE.BALANCED].LLM_PROVIDER;
  }

  const output: AIConfig = {
    score: complexityScore,
    llmProvider: config.general.llm && config.model.name ? config.general.llm : llmProvider,
    recommendedModel,
    suggestionFlag: "",
    resolvedModel: config.model.name || recommendedModel,
  };

  logger.info(`Decided on ai model ${output.resolvedModel} preference`)

  if (!config.model.name) {
    output.resolvedModel = recommendedModel;
    output.suggestionFlag = "User provided no model. Successfully locked onto optimal recommendation.";
    return output;
  }

  if (config.model.overridePolicy === OVERRIDE_POLICY.AUTO) {
    output.resolvedModel = recommendedModel;
    output.suggestionFlag = `AUTO OVERRIDE: Swapped user model [${config.model.name}] -> [${recommendedModel}] due to configuration policy.`;
  } else if (config.model.overridePolicy === OVERRIDE_POLICY.SUGGEST && config.model.name !== recommendedModel) {
    output.suggestionFlag = `SUGGESTION: You are using [${config.model.name}]. Based on complexity of ${complexityScore}, we optimally recommend running [${recommendedModel}].`;
  } else if (config.model.overridePolicy === 'never') {
    output.suggestionFlag = `POLICY=NEVER: Retaining strictly user-configured model [${config.model.name}]. Recommendation ignored.`;
  }

  return output;
}
