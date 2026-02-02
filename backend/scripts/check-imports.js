#!/usr/bin/env node
/**
 * Check for missing .js extensions in ES module imports
 * This script validates that all relative imports have .js extensions
 * which is required for ES modules in Node.js/Vercel serverless functions
 */

const fs = require("fs");
const path = require("path");


// Directories to check
const SRC_DIR = path.join(__dirname, "..", "src");
const API_DIR = path.join(__dirname, "..", "api");

// Patterns to match relative imports
const RELATIVE_IMPORT_PATTERN = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
const RELATIVE_REQUIRE_PATTERN = /require\s*\(\s*['"](\.\.?\/[^'"]+)['"]\s*\)/g;

// Global errors array
const errors = [];


/**
 * Check if a file should be checked (TypeScript/JavaScript files)
 */
function shouldCheckFile(filePath) {
    const ext = path.extname(filePath);
    return [".ts", ".tsx", ".js", ".jsx"].includes(ext);
}

/**
 * Check if an import path needs .js extension
 */
function needsJsExtension(importPath) {
    // Skip if already has .js extension
    if (importPath.endsWith(".js")) {
        return false;
    }

    // Skip if it's a directory import (will have / at end or no extension)
    // Skip node_modules and external packages
    if (
        importPath.startsWith(".") &&
        !importPath.includes("node_modules") &&
        !importPath.startsWith("@")
    ) {
        // Check if it's a relative import without .js
        // Allow .json, .css, etc. but require .js for .ts/.js files
        const hasExtension = /\.\w+$/.test(importPath);
        if (!hasExtension || (hasExtension && !importPath.endsWith(".json") && !importPath.endsWith(".css") && !importPath.endsWith(".yaml") && !importPath.endsWith(".yml"))) {
            return true;
        }
    }

    return false;
}

/**
 * Check a single file for import errors
 */
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Check import statements
    let match;
    RELATIVE_IMPORT_PATTERN.lastIndex = 0;
    while ((match = RELATIVE_IMPORT_PATTERN.exec(content)) !== null) {
        const importPath = match[1];
        const lineNumber = content.substring(0, match.index).split("\n").length;

        if (needsJsExtension(importPath)) {
            errors.push({
                file: path.relative(process.cwd(), filePath),
                line: lineNumber,
                import: importPath,
                message: `Missing .js extension in import: "${importPath}"`,
            });
        }
    }

    // Check require statements
    RELATIVE_REQUIRE_PATTERN.lastIndex = 0;
    while ((match = RELATIVE_REQUIRE_PATTERN.exec(content)) !== null) {
        const importPath = match[1];
        const lineNumber = content.substring(0, match.index).split("\n").length;

        if (needsJsExtension(importPath)) {
            errors.push({
                file: path.relative(process.cwd(), filePath),
                line: lineNumber,
                import: importPath,
                message: `Missing .js extension in require: "${importPath}"`,
            });
        }
    }
}

/**
 * Recursively check all files in a directory
 */
function checkDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip node_modules, dist, .git, etc.
        if (
            entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === "dist" ||
            entry.name === "generated"
        ) {
            continue;
        }

        if (entry.isDirectory()) {
            checkDirectory(fullPath);
        } else if (entry.isFile() && shouldCheckFile(fullPath)) {
            checkFile(fullPath);
        }
    }
}

/**
 * Main function
 */
function main() {
    console.log("🔍 Checking for missing .js extensions in imports...\n");

    // Check src directory
    if (fs.existsSync(SRC_DIR)) {
        console.log(`📁 Checking ${SRC_DIR}...`);
        checkDirectory(SRC_DIR);
    }

    // Check api directory
    if (fs.existsSync(API_DIR)) {
        console.log(`📁 Checking ${API_DIR}...`);
        checkDirectory(API_DIR);
    }

    // Report results
    if (errors.length === 0) {
        console.log("\n✅ All imports have .js extensions!");
        process.exit(0);
    } else {
        console.error(`\n❌ Found ${errors.length} import error(s) without .js extensions:\n`);

        // Group errors by file
        const errorsByFile = new Map();
        for (const error of errors) {
            if (!errorsByFile.has(error.file)) {
                errorsByFile.set(error.file, []);
            }
            errorsByFile.get(error.file).push(error);
        }

        // Print errors grouped by file
        for (const [file, fileErrors] of errorsByFile.entries()) {
            console.error(`\n📄 ${file}:`);
            for (const error of fileErrors) {
                console.error(`   Line ${error.line}: ${error.message}`);
                console.error(`   Import: ${error.import}`);
            }
        }

        console.error("\n💡 Fix: Add .js extension to all relative imports");
        console.error("   Example: import { x } from './file' → import { x } from './file.js'");

        process.exit(1);
    }
}

main();
