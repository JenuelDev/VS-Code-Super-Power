import * as vscode from 'vscode';

function findInnermostFunction(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (!symbol.range.contains(position)) {
      continue;
    }
    const childMatch = findInnermostFunction(symbol.children, position);
    if (childMatch) {
      return childMatch;
    }
    if (
      symbol.kind === vscode.SymbolKind.Function ||
      symbol.kind === vscode.SymbolKind.Method ||
      symbol.kind === vscode.SymbolKind.Constructor
    ) {
      return symbol;
    }
  }
  return undefined;
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-super-power.copyLineReference', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
      const line = editor.selection.active.line + 1;
      const reference = `${relativePath}::${line}`;

      await vscode.env.clipboard.writeText(reference);
      vscode.window.showInformationMessage(`Copied: ${reference}`);
    }),

    vscode.commands.registerCommand('vscode-super-power.copyFunctionReference', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        editor.document.uri
      );

      if (!symbols) {
        vscode.window.showWarningMessage('No symbol provider available for this file type.');
        return;
      }

      const position = editor.selection.active;
      const fn = findInnermostFunction(symbols, position);

      if (!fn) {
        vscode.window.showWarningMessage('No function found at cursor position.');
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
      const reference = `${relativePath}::${fn.name}()`;

      await vscode.env.clipboard.writeText(reference);
      vscode.window.showInformationMessage(`Copied: ${reference}`);
    })
  );
}

export function deactivate() {}
