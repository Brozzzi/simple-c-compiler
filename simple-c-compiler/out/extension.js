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
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const compiler_1 = require("./compiler");
let outputChannel;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "simple-c-compiler" is now active!');
    // Create output channel for displaying compilation and execution results
    outputChannel = vscode.window.createOutputChannel('Simple C Compiler');
    // Detect available compilers on first activation
    const availableCompilers = await (0, compiler_1.detectCompilers)();
    if (availableCompilers.length === 0) {
        vscode.window.showWarningMessage('No C/C++ compiler detected. Please install GCC, Clang, or MSVC.');
        outputChannel.appendLine('⚠️ No C/C++ compilers found on this system.');
        return;
    }
    // If no compiler is selected yet, automatically select the first available one
    let selectedCompiler = (0, compiler_1.getSelectedCompiler)(context);
    if (!selectedCompiler) {
        selectedCompiler = availableCompilers[0];
        await (0, compiler_1.setSelectedCompiler)(selectedCompiler.name);
        vscode.window.showInformationMessage(`Auto-selected compiler: ${selectedCompiler.name}`);
        outputChannel.appendLine(`✅ Auto-selected compiler: ${selectedCompiler.name}`);
    }
    // Register the compile and execute command
    const compileDisposable = vscode.commands.registerCommand('simple-c-compiler.compile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is open');
            return;
        }
        const filePath = editor.document.fileName;
        const fileExt = filePath.split('.').pop()?.toLowerCase();
        if (fileExt !== 'c' && fileExt !== 'cpp' && fileExt !== 'cc' && fileExt !== 'cxx') {
            vscode.window.showErrorMessage('This is not a C/C++ file');
            return;
        }
        const currentCompiler = (0, compiler_1.getSelectedCompiler)(context) || selectedCompiler;
        if (!currentCompiler) {
            vscode.window.showErrorMessage('No compiler selected');
            return;
        }
        await (0, compiler_1.compileAndExecute)(filePath, currentCompiler, outputChannel);
    });
    // Register the select compiler command
    const selectCompilerDisposable = vscode.commands.registerCommand('simple-c-compiler.selectCompiler', async () => {
        const compilers = await (0, compiler_1.detectCompilers)();
        if (compilers.length === 0) {
            vscode.window.showErrorMessage('No C/C++ compiler detected');
            return;
        }
        const selected = await vscode.window.showQuickPick(compilers.map(c => c.name), { placeHolder: 'Select a C/C++ compiler' });
        if (selected) {
            await (0, compiler_1.setSelectedCompiler)(selected);
            vscode.window.showInformationMessage(`Compiler set to: ${selected}`);
            outputChannel.appendLine(`✅ Compiler changed to: ${selected}`);
        }
    });
    context.subscriptions.push(compileDisposable);
    context.subscriptions.push(selectCompilerDisposable);
    context.subscriptions.push(outputChannel);
}
// This method is called when your extension is deactivated
function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
    (0, compiler_1.disposeTerminal)();
}
//# sourceMappingURL=extension.js.map