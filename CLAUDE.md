# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VS Code Super Power** is a VS Code extension built with TypeScript. It extends VS Code with productivity "super powers" — starting with copy-reference commands (copy line ref, copy function ref from the editor context menu).

## Development Setup

```bash
npm install
```

## Build & Run Commands

| Task | Command |
|------|---------|
| Compile TypeScript | `npm run compile` |
| Watch mode (auto-recompile) | `npm run watch` |
| Lint | `npm run lint` |
| Run all tests | `npm test` |
| Package as VSIX | `npx @vscode/vsce package` |

To launch the extension in development: press **F5** in VS Code (opens an Extension Development Host window). After code changes, run **Developer: Reload Window** in the host to pick up updates.

## Testing

- Framework: **Mocha** via `@vscode/test-cli` and `@vscode/test-electron`
- Test files live in `src/test/` and follow the `*.test.ts` naming convention
- Config: `.vscode-test.mjs` at the project root
- Run a single test: `npx vscode-test --grep "test name pattern"`
- Debug tests: use the "Extension Tests" launch configuration in `.vscode/launch.json`

## Architecture

### Extension Lifecycle

- **Entry point**: `src/extension.ts` exports `activate()` and `deactivate()`
- `activate()` fires when an activation event triggers (e.g., a registered command is invoked)
- Register commands/providers inside `activate()` and push disposables to `context.subscriptions`
- `deactivate()` handles cleanup on extension shutdown

### Extension Manifest (`package.json`)

- **`contributes`**: Declares commands, menus, keybindings, views, settings, and other UI contributions
- **`activationEvents`**: Controls when the extension loads (commands declared in `contributes` auto-generate activation events since VS Code 1.74+)
- **`main`**: Points to the compiled JS entry point (typically `./out/extension.js`)
- **`engines.vscode`**: Minimum VS Code version required

### Key Pattern: Command Registration

1. Declare the command in `package.json` under `contributes.commands`
2. In `activate()`, bind the command ID to a handler via `vscode.commands.registerCommand()`
3. Push the returned disposable to `context.subscriptions`

### Function Symbol Resolution

The "Copy Function Reference" command uses `vscode.executeDocumentSymbolProvider` to find the function at the cursor. This delegates to whatever language extension provides symbols for the file type (TypeScript built-in, Python extension, etc.), so it works across all languages without language-specific code. The helper `findInnermostFunction()` does a recursive depth-first search to find the innermost function/method/constructor containing the cursor position.

### Compiled Output

TypeScript compiles to `out/` directory. The `main` field in `package.json` points to `./out/extension.js`. Never edit files in `out/` directly.

## References

- VS Code Extension API: https://code.visualstudio.com/api
- Extension anatomy: https://code.visualstudio.com/api/get-started/extension-anatomy
- Extension testing: https://code.visualstudio.com/api/working-with-extensions/testing-extension
