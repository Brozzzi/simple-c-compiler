// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { detectCompilers, getSelectedCompiler, setSelectedCompiler, compileAndExecute, disposeTerminal, CompilerInfo } from './compiler';

let outputChannel: vscode.OutputChannel;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "simple-c-compiler" is now active!');

	// Create output channel for displaying compilation and execution results
	outputChannel = vscode.window.createOutputChannel('Simple C Compiler');

	// Detect available compilers on first activation
	const availableCompilers = await detectCompilers();
	if (availableCompilers.length === 0) {
		vscode.window.showWarningMessage('No C/C++ compiler detected. Please install GCC, Clang, or MSVC.');
		outputChannel.appendLine('⚠️ No C/C++ compilers found on this system.');
		return;
	}

	// If no compiler is selected yet, automatically select the first available one
	let selectedCompiler = getSelectedCompiler(context);
	if (!selectedCompiler) {
		selectedCompiler = availableCompilers[0];
		await setSelectedCompiler(selectedCompiler.name);
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

		const currentCompiler = getSelectedCompiler(context) || selectedCompiler;
		if (!currentCompiler) {
			vscode.window.showErrorMessage('No compiler selected');
			return;
		}

		await compileAndExecute(filePath, currentCompiler, outputChannel);
	});

	// Register the select compiler command
	const selectCompilerDisposable = vscode.commands.registerCommand('simple-c-compiler.selectCompiler', async () => {
		const compilers = await detectCompilers();
		if (compilers.length === 0) {
			vscode.window.showErrorMessage('No C/C++ compiler detected');
			return;
		}

		const selected = await vscode.window.showQuickPick(
			compilers.map(c => c.name),
			{ placeHolder: 'Select a C/C++ compiler' }
		);

		if (selected) {
			await setSelectedCompiler(selected);
			vscode.window.showInformationMessage(`Compiler set to: ${selected}`);
			outputChannel.appendLine(`✅ Compiler changed to: ${selected}`);
		}
	});

	context.subscriptions.push(compileDisposable);
	context.subscriptions.push(selectCompilerDisposable);
	context.subscriptions.push(outputChannel);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (outputChannel) {
		outputChannel.dispose();
	}
	disposeTerminal();
}
