#!/usr/bin/env node

import logger from "../config/logger";
import { getInputDetails } from "../controllers/dataController";
import { generateTests } from "../controllers/GenerateTestCase";

async function main() {
    logger.info("Running ts-genai-test...");
    const { inputs: inputPromptDetails, ctx } = getInputDetails();
    await generateTests(inputPromptDetails, ctx); // default behavior
}

main();