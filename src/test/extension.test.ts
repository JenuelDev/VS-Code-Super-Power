import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Commands are registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('vscode-super-power.copyLineReference'));
    assert.ok(commands.includes('vscode-super-power.copyFunctionReference'));
  });
});
