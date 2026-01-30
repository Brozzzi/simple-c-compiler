import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface CompilerInfo {
  name: string;
  command: string;
  outputFlag: string;
}

let terminal: vscode.Terminal | null = null;

/**
 * Gets or creates a persistent terminal for C/C++ compilation and execution
 */
function getOrCreateTerminal(): vscode.Terminal {
  if (terminal === null || terminal.exitStatus !== undefined) {
    terminal = vscode.window.createTerminal('C/C++ Compiler');
  }
  return terminal;
}

/**
 * Detects available C/C++ compilers on the system based on platform
 */
export async function detectCompilers(): Promise<CompilerInfo[]> {
  const compilers: CompilerInfo[] = [];
  const platform = process.platform;

  const compilerCandidates: { [key: string]: CompilerInfo } = {
    gcc: { name: 'GCC', command: 'gcc', outputFlag: '-o' },
    clang: { name: 'Clang', command: 'clang', outputFlag: '-o' },
    'clang++': { name: 'Clang++', command: 'clang++', outputFlag: '-o' },
    'g++': { name: 'G++', command: 'g++', outputFlag: '-o' },
    cl: { name: 'MSVC', command: 'cl', outputFlag: '/Fe' },
  };

  // Platform-specific compiler detection
  let toCheck: string[] = [];
  if (platform === 'darwin') {
    toCheck = ['clang', 'gcc', 'clang++', 'g++'];
  } else if (platform === 'linux') {
    toCheck = ['gcc', 'clang', 'g++', 'clang++'];
  } else if (platform === 'win32') {
    toCheck = ['cl', 'gcc', 'clang'];
  }

  for (const compiler of toCheck) {
    try {
      if (platform === 'win32') {
        execSync(`where ${compiler}`, { stdio: 'ignore' });
      } else {
        execSync(`which ${compiler}`, { stdio: 'ignore' });
      }
      if (compilerCandidates[compiler]) {
        compilers.push(compilerCandidates[compiler]);
      }
    } catch (error) {
      // Compiler not found, continue
    }
  }

  return compilers;
}

/**
 * Gets the currently selected compiler from workspace settings
 */
export function getSelectedCompiler(context: vscode.ExtensionContext): CompilerInfo | null {
  const config = vscode.workspace.getConfiguration('simpleCCompiler');
  const selectedCompilerName = config.get<string>('compiler') || '';

  if (!selectedCompilerName) {
    return null;
  }

  // Map compiler names back to CompilerInfo
  const compilerMap: { [key: string]: CompilerInfo } = {
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
export async function setSelectedCompiler(compilerName: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('simpleCCompiler');
  await config.update('compiler', compilerName, vscode.ConfigurationTarget.Workspace);
}

/**
 * Compiles and executes a C/C++ file in the integrated terminal
 */
export async function compileAndExecute(
  filePath: string,
  compiler: CompilerInfo,
  outputChannel: vscode.OutputChannel
): Promise<void> {
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

    execSync(compileCommand, { cwd: fileDir, stdio: 'pipe' });

    outputChannel.appendLine('✅ Compilation successful!');
    outputChannel.appendLine('');
  } catch (compileError: any) {
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
export function disposeTerminal(): void {
  if (terminal !== null) {
    terminal.dispose();
    terminal = null;
  }
}
