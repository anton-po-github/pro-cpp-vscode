import * as vscode from 'vscode';

// -----------------------------------------------------------------------------
// TERMINAL MANAGER
// Architected to handle Workspace Context and graceful error checking
// -----------------------------------------------------------------------------
export class TerminalManager {
    private terminal: vscode.Terminal | undefined;

    // Retrieves the current workspace path or returns null if no folder is open
    private getWorkspacePath(): string | null {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return null;
    }

    // Retrieves the existing terminal or creates a new one scoped to the workspace
    public getTerminal(): vscode.Terminal | null {
        const workspacePath = this.getWorkspacePath();

        if (!workspacePath) {
            vscode.window.showErrorMessage('❌ PRO C++: Please open a folder (workspace) first!');
            return null;
        }

        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal({
                name: "PRO C++ Engine",
                cwd: workspacePath // FORCE terminal to open in the project folder!
            });
        }
        return this.terminal;
    }

    // Executes a given command in the integrated terminal
    public executeCommand(command: string): void {
        const term = this.getTerminal();
        if (term) {
            term.show();
            term.sendText('clear');
            term.sendText(command);
        }
    }

    // Cleans up resources
    public dispose(): void {
        if (this.terminal) {
            this.terminal.dispose();
        }
    }
}

// Global instance of our manager
const terminalManager = new TerminalManager();

// -----------------------------------------------------------------------------
// EXTENSION ACTIVATION
// -----------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('🚀 PRO C++ Extension is initializing...');

        // 1. Setup Status Bar UI
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(zap) PRO C++ Watcher";
        statusBarItem.tooltip = "Click to start the C++ Hot-Reload Watcher";
        statusBarItem.command = "procpp.watch"; 
        statusBarItem.show();

        context.subscriptions.push(statusBarItem);

        // 2. Register 'Watch' Command (EXE)
        let watchCommand = vscode.commands.registerCommand('procpp.watch', () => {
            terminalManager.executeCommand('procpp watch');
        });

        // 3. Register 'Build DLL' Command (.NET 10+)
        let buildDllCommand = vscode.commands.registerCommand('procpp.buildDll', async () => {
            const dllName = await vscode.window.showInputBox({
                prompt: "Enter the desired name for your DLL (e.g., CoreEngine)",
                placeHolder: "Leave empty for default 'ProLibrary'",
                ignoreFocusOut: true
            });

            // Prevent execution if user cancels the input box
            if (dllName === undefined) {
                return; 
            }

            const command = dllName.trim() === '' ? 'procpp watch dll' : `procpp watch dll ${dllName}`;
            terminalManager.executeCommand(command);
        });

        context.subscriptions.push(watchCommand, buildDllCommand);
        console.log('✅ PRO C++ Extension activated successfully!');
        
    } catch (error) {
        console.error('❌ FATAL ERROR during PRO C++ Extension activation:', error);
    }
}

// -----------------------------------------------------------------------------
// EXTENSION DEACTIVATION
// -----------------------------------------------------------------------------
export function deactivate() {
    terminalManager.dispose();
}