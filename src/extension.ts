import * as vscode from 'vscode';

function findFunctionAtDeclaration(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (!symbol.range.contains(position)) {
      continue;
    }
    // Check children first (depth-first for innermost match)
    const childMatch = findFunctionAtDeclaration(symbol.children, position);
    if (childMatch) {
      return childMatch;
    }
    // Only match if cursor is on the declaration line (selectionRange = the function name)
    if (
      (symbol.kind === vscode.SymbolKind.Function ||
        symbol.kind === vscode.SymbolKind.Method ||
        symbol.kind === vscode.SymbolKind.Constructor) &&
      symbol.selectionRange.start.line === position.line
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
      const fn = findFunctionAtDeclaration(symbols, position);

      if (!fn) {
        vscode.window.showWarningMessage('No function found at cursor position.');
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
      const reference = `${relativePath}::${fn.name}()`;

      await vscode.env.clipboard.writeText(reference);
      vscode.window.showInformationMessage(`Copied: ${reference}`);
    }),

    vscode.commands.registerCommand('vscode-super-power.copyReference', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
      const position = editor.selection.active;

      // Try to find a function at cursor
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        editor.document.uri
      );

      const fn = symbols ? findFunctionAtDeclaration(symbols, position) : undefined;

      if (fn) {
        const reference = `${relativePath}::${fn.name}()`;
        await vscode.env.clipboard.writeText(reference);
        vscode.window.showInformationMessage(`Copied: ${reference}`);
      } else {
        const line = position.line + 1;
        const reference = `${relativePath}::${line}`;
        await vscode.env.clipboard.writeText(reference);
        vscode.window.showInformationMessage(`Copied: ${reference}`);
      }
    })
  );
}

export function deactivate() {}
