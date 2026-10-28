import * as vscode from "vscode";
import { TypingPty } from "./terminal/TypingPty";
import { CodePracticeSession } from "./editor/CodePracticeSession";

export function activate(context: vscode.ExtensionContext): void {
  // --- Terminal typing (programming phrases) ---
  const startTerminal = vscode.commands.registerCommand("typePractice.start", () => {
    const pty = new TypingPty(25);
    const terminal = vscode.window.createTerminal({
      name: "Type Practice",
      pty,
    });
    context.subscriptions.push(terminal);
    terminal.show();
  });

  const terminalBtn = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  terminalBtn.text = "$(keyboard) Type";
  terminalBtn.tooltip = "Type Practice: Programming words in terminal";
  terminalBtn.command = "typePractice.start";
  terminalBtn.show();

  // --- Editor code practice ---
  let codeSession: CodePracticeSession | null = null;

  const startCode = vscode.commands.registerCommand("typePractice.code", async () => {
    if (codeSession) {
      codeSession.dispose();
    }
    codeSession = new CodePracticeSession();
    await codeSession.start();
  });

  const codeBtn = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    99
  );
  codeBtn.text = "$(file-code) Code";
  codeBtn.tooltip = "Type Practice: Practice typing code from your project";
  codeBtn.command = "typePractice.code";
  codeBtn.show();

  context.subscriptions.push(startTerminal, startCode, terminalBtn, codeBtn);
}

export function deactivate(): void {
  // no-op
}
