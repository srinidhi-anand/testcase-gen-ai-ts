import { execSync } from "child_process";
import ts from "typescript";
import fs from "fs";
import path from "path";
import { ExecutionContext, IFunctions, PromptInput } from "../types/functionalPromptType";
import logger from "../config/logger";

function getPathFiles(targetPath: string): string[] {
    const absPath = path.resolve(process.cwd(), targetPath);
    if (!fs.existsSync(absPath)) return [];

    if (fs.statSync(absPath).isDirectory()) {
        return getAllTsFiles(absPath);
    } else if (absPath.endsWith(".ts")) {
        return [absPath];
    }
    return [];
}

function getAllTsFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllTsFiles(fullPath, arrayOfFiles);
        } else if (fullPath.endsWith(".ts")) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

export function getStagedFiles(ctx: ExecutionContext): string[] {
    const output = execSync(
        "git diff --name-only --cached",
        { cwd: ctx.rootDir, encoding: "utf-8" }
    );

    return output
        .split("\n")
        .filter(f => f.endsWith(".ts"))
        .filter(f => {
            if (ctx.pathFilter) {
                // Ensure it matches anywhere in the path string for flexibility
                return f.includes(ctx.pathFilter);
            }
            return true;
        });
}


export function extractFunctions(filePath: string) {
    const source = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true
    );

    let functions: IFunctions[] = [];

    function visit(node: ts.Node) {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node)
        ) {
            const name = node.name?.getText() || "anonymous";
            const modifiers = node.modifiers || [];

            const isDefaultExport = modifiers.some(
                (m) => m.kind === ts.SyntaxKind.DefaultKeyword
            ) || false;

            const isNamedExport = modifiers.some(
                (m) => m.kind === ts.SyntaxKind.ExportKeyword
            ) || false;
            functions.push({ name, isDefaultExport, isNamedExport, file: filePath });
        }

        if (ts.isExportAssignment(node)) {
            if (ts.isIdentifier(node.expression)) {
                const expNode = node.expression.text;
                functions = functions.map(fn => {
                    if (fn && expNode === fn.name) {
                        fn.isDefaultExport = true;
                    }
                    return fn;
                });

            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    console.log(`\n\n functions \n\n`, functions)
    return functions;
}


export function getProjectRoot() {
    return process.cwd();
}

export function frameInputs(functions: IFunctions[], rootDir: string, testsFolder?: string) {
    const results: PromptInput[] = [];
    logger.info(`Started framing inputs for ${functions.length} function(s)`);
    for (const fn of functions) {
        logger.info(`Generating test for ${fn.name} from file ${fn.file}`);
        results.push({
            outputTestDir: path.resolve(rootDir, testsFolder || "__tests__" || "tests"),
            testFileName: "",
            folderPath: path.resolve(rootDir, path.dirname(fn.file)),
            filePath: path.resolve(rootDir, fn.file),
            functionName: fn.name,
            functions: [],
            rootPath: rootDir,
            isDefaultExport: fn.isDefaultExport,
        })
    }
    logger.info(`Completed framing inputs for ${functions.length} function(s)`);
    return results;
}

export function getCtx() {
    const rawArgs = process.argv.slice(2);
    const command = rawArgs[0] || ''; // generate / run
    const args: Record<string, string | null> = {};

    for (let i = 0; i < rawArgs.length; i++) {
        const argsElement = rawArgs[i] || '';
        if (!argsElement) {
            // pass no element present
            continue;
        }

        if (argsElement && argsElement.startsWith("--")) {
            const key = argsElement.replace("--", "");
            const nextArg = rawArgs[i + 1] || null;
            // Prevent flag pollution where `--override` accidentally takes `--path` as its value
            const value = (nextArg && !nextArg.startsWith("--")) ? nextArg : null;
            args[key] = value;
        }
    }

    const ctx: ExecutionContext = {
        rootDir: args.root || process.cwd(),
        isStaged: rawArgs.includes("--staged"),
        override: rawArgs.includes("--override"),
        command,
        pathFilter: args.path || null,
        functionFilter: args.function || null,
    };

    return ctx;
}

export function getInputDetails(rootDir?: string, testsFolder?: string): { inputs: PromptInput[], ctx: ExecutionContext } {
    // sample output template of inputDetails
    // {
    //   outDir: path.resolve(__dirname, "../__tests__/"),
    //   testFileName: "",
    //   folderPath: path.resolve(__dirname, "../src"),
    //   filePath: path.resolve(__dirname, "../src/isNull"),
    //   functionName: "isNull",
    //   functions: []
    // },

    let inputs: PromptInput[] = [];
    const ctx = getCtx();
    const projectRoot = rootDir || ctx.rootDir || getProjectRoot();


    if (ctx.command === 'generate') {
        const files = getStagedFiles(ctx);
        for (const file of files) {
            const functions = extractFunctions(file);
            const filteredFunctions = ctx.functionFilter ? functions.filter(f => f.name === ctx.functionFilter) : functions;
            inputs = [...inputs, ...frameInputs(filteredFunctions, projectRoot, testsFolder)];
        }
    } else if (ctx.command === 'run') {
        if (!ctx.pathFilter) {
            logger.error("CRITICAL: 'run' command explicitly requires a --path argument!");
            return { inputs: [], ctx };
        }
        const files = getPathFiles(ctx.pathFilter);
        logger.info(`files count: ${files.length}`)
        for (const file of files) {
            const functions = extractFunctions(file);
            const filteredFunctions = ctx.functionFilter ? functions.filter(f => f.name === ctx.functionFilter) : functions;
            inputs = [...inputs, ...frameInputs(filteredFunctions, projectRoot, testsFolder)];
        }
    }

    return { inputs, ctx };
}