"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCompilers = detectCompilers;
exports.getSelectedCompiler = getSelectedCompiler;
exports.setSelectedCompiler = setSelectedCompiler;
exports.compileAndExecute = compileAndExecute;
exports.disposeTerminal = disposeTerminal;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
let terminal = null;
/**
 * Gets or creates a persistent terminal for C/C++ compilation and execution
 */
function getOrCreateTerminal() {
    if (terminal === null || terminal.exitStatus !== undefined) {
        terminal = vscode.window.createTerminal('C/C++ Compiler');
    }
    return terminal;
}
/**
 * Detects available C/C++ compilers on the system based on platform
 */
async function detectCompilers() {
    const compilers = [];
    const platform = process.platform;
    const compilerCandidates = {
        gcc: { name: 'GCC', command: 'gcc', outputFlag: '-o' },
        clang: { name: 'Clang', command: 'clang', outputFlag: '-o' },
        'clang++': { name: 'Clang++', command: 'clang++', outputFlag: '-o' },
        'g++': { name: 'G++', command: 'g++', outputFlag: '-o' },
        cl: { name: 'MSVC', command: 'cl', outputFlag: '/Fe' },
    };
    // Platform-specific compiler detection
    let toCheck = [];
    if (platform === 'darwin') {
        toCheck = ['clang', 'gcc', 'clang++', 'g++'];
    }
    else if (platform === 'linux') {
        toCheck = ['gcc', 'clang', 'g++', 'clang++'];
    }
    else if (platform === 'win32') {
        toCheck = ['cl', 'gcc', 'clang'];
    }
    for (const compiler of toCheck) {
        try {
            if (platform === 'win32') {
                (0, child_process_1.execSync)(`where ${compiler}`, { stdio: 'ignore' });
            }
            else {
                (0, child_process_1.execSync)(`which ${compiler}`, { stdio: 'ignore' });
            }
            if (compilerCandidates[compiler]) {
                compilers.push(compilerCandidates[compiler]);
            }
        }
        catch (error) {
            // Compiler not found, continue
        }
    }
    return compilers;
}
/**
 * Gets the currently selected compiler from workspace settings
 */
function getSelectedCompiler(context) {
    const config = vscode.workspace.getConfiguration('simpleCCompiler');
    const selectedCompilerName = config.get('compiler') || '';
    if (!selectedCompilerName) {
        return null;
    }
    // Map compiler names back to CompilerInfo
    const compilerMap = {
        'GCC': { name: 'GCC', command: 'gcc', outputFlag: '-o' },
        'Clang': { name: 'Clang', command: 'clang', outputFlag: '-o' },
        'Clang++': { name: 'Clang++', command: 'clang++', outputFlag: '-o' },
        'G++': { name: 'G++', command: 'g++', outputFlag: '-o' },
        'MSVC': { name: 'MSVC', command: 'cl', outputFlag: '/Fe' },
    };
    return compilerMap[selectedCompilerName] || null;
}
/**
 * Sets the selected compiler in workspace settings
 */
async function setSelectedCompiler(compilerName) {
    const config = vscode.workspace.getConfiguration('simpleCCompiler');
    await config.update('compiler', compilerName, vscode.ConfigurationTarget.Workspace);
}
/**
 * Compiles and executes a C/C++ file in the integrated terminal
 */
async function compileAndExecute(filePath, compiler, outputChannel) {
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const fileNameWithoutExt = path.parse(fileName).name;
    // Determine output file name based on platform
    const isWindows = process.platform === 'win32';
    const outputFileName = isWindows ? `${fileNameWithoutExt}.exe` : fileNameWithoutExt;
    const outputFile = path.join(fileDir, outputFileName);
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] Compiling: ${fileName}`);
    outputChannel.appendLine(`Compiler: ${compiler.name}`);
    outputChannel.appendLine(`Directory: ${fileDir}`);
    outputChannel.appendLine('');
    // Step 1: Compile synchronously
    try {
        const compileCommand = `${compiler.command} "${filePath}" ${compiler.outputFlag} "${outputFile}"`;
        outputChannel.appendLine(`Command: ${compileCommand}`);
        outputChannel.appendLine('');
        (0, child_process_1.execSync)(compileCommand, { cwd: fileDir, stdio: 'pipe' });
        outputChannel.appendLine('✅ Compilation successful!');
        outputChannel.appendLine('');
    }
    catch (compileError) {
        const errorMessage = compileError.stderr?.toString() || compileError.stdout?.toString() || compileError.message;
        outputChannel.appendLine('❌ Compilation failed:');
        outputChannel.appendLine(errorMessage);
        return;
    }
    // Step 2: Execute in terminal (asynchronously for user interaction)
    const term = getOrCreateTerminal();
    term.show(false); // Show without stealing focus from editor
    // Send clear command based on platform
    const clearCommand = isWindows ? 'cls' : 'clear';
    term.sendText(clearCommand);
    // Change to the file directory
    const cdCommand = isWindows ? `cd /d "${fileDir}"` : `cd "${fileDir}"`;
    term.sendText(cdCommand);
    // Send execution command
    const executeCommand = isWindows ? outputFileName : `./${fileNameWithoutExt}`;
    term.sendText(executeCommand);
    outputChannel.appendLine('--- Execution Output (see Terminal) ---');
}
/**
 * Disposes the terminal when extension deactivates
 */
function disposeTerminal() {
    if (terminal !== null) {
        terminal.dispose();
        terminal = null;
    }
}
//# sourceMappingURL=compiler.js.map