import * as vscode from 'vscode';

// We keep a reference to our custom terminal to ensure we do not spawn duplicates
let proTerminal: vscode.Terminal | undefined;

// Helper function to robustly get or create our PRO C++ Terminal instance
function getTerminal(): vscode.Terminal {
    if (!proTerminal || proTerminal.exitStatus !== undefined) {
        proTerminal = vscode.window.createTerminal({
            name: "PRO C++ Engine"
        });
    }
    return proTerminal;
}

// Extension activation entry point
export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('🚀 PRO C++ Extension is initializing...');

        // Create a prominent Status Bar Item for quick access
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(zap) PRO C++ Watcher";
        statusBarItem.tooltip = "Click to start the C++ Hot-Reload Watcher";
        statusBarItem.command = "procpp.watch"; 
        statusBarItem.show();

        context.subscriptions.push(statusBarItem);

        // Register the standard watch command (EXE target)
        let watchCommand = vscode.commands.registerCommand('procpp.watch', () => {
            const terminal = getTerminal();
            terminal.show(); 
            terminal.sendText('clear');
            terminal.sendText('procpp watch');
        });

        // Register the DLL build command (.NET 10+ target integration)
        let buildDllCommand = vscode.commands.registerCommand('procpp.buildDll', async () => {
            const dllName = await vscode.window.showInputBox({
                prompt: "Enter the desired name for your DLL (e.g., CoreEngine)",
                placeHolder: "Leave empty for default 'ProLibrary'",
                ignoreFocusOut: true
            });

            // Handle user cancellation gracefully
            if (dllName === undefined) {
                return; 
            }

            const terminal = getTerminal();
            terminal.show();
            terminal.sendText('clear');
            
            // Format the command based on user input for dynamic DLL naming
            const command = dllName.trim() === '' ? 'procpp watch dll' : `procpp watch dll ${dllName}`;
            terminal.sendText(command);
        });

        // Register all commands to the extension context for proper cleanup
        context.subscriptions.push(watchCommand, buildDllCommand);
        console.log('✅ PRO C++ Extension activated successfully!');
        
    } catch (error) {
        // Log critical errors directly to the VS Code extension host console
        console.error('❌ FATAL ERROR during PRO C++ Extension activation:', error);
    }
}

// Extension deactivation cleanup routine
export function deactivate() {
    if (proTerminal) {
        proTerminal.dispose();
    }
}