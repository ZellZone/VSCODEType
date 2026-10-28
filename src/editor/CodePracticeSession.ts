import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const CODE_EXTENSIONS = [".js", ".jsx", ".php"];

export class CodePracticeSession {
  private lines: string[] = [];
  private currentLineIndex = 0;
  private doc: vscode.TextDocument | null = null;
  private editor: vscode.TextEditor | null = null;
  private disposables: vscode.Disposable[] = [];
  private startTime: number | null = null;
  private totalKeystrokes = 0;
  private correctKeystrokes = 0;
  private decorationCorrect: vscode.TextEditorDecorationType;
  private decorationError: vscode.TextEditorDecorationType;
  private decorationHint: vscode.TextEditorDecorationType;
  private statusBar: vscode.StatusBarItem;
  private active = false;
  private processing = false;

  constructor() {
    this.decorationCorrect = vscode.window.createTextEditorDecorationType({
      color: "#4ec9b0",
    });
    this.decorationError = vscode.window.createTextEditorDecorationType({
      color: "#f44747",
      backgroundColor: "rgba(244,71,71,0.15)",
    });
    this.decorationHint = vscode.window.createTextEditorDecorationType({
      color: "#666666",
      fontStyle: "italic",
    });
    this.statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      50
    );
  }

  async start(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage("Type Practice: 請先開啟一個資料夾。");
      return;
    }

    const rootPath = workspaceFolders[0]!.uri.fsPath;
    const file = await this.pickRandomFile(rootPath);
    if (!file) {
      vscode.window.showWarningMessage("Type Practice: 找不到可練習的程式檔案。");
      return;
    }

    const content = fs.readFileSync(file, "utf-8");
    this.lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (this.lines.length === 0) {
      vscode.window.showWarningMessage("Type Practice: 選到的檔案是空的。");
      return;
    }

    // Open an untitled document for practice
    this.doc = await vscode.workspace.openTextDocument({
      language: this.detectLanguage(file),
      content: "",
    });
    this.editor = await vscode.window.showTextDocument(this.doc, {
      preview: false,
    });

    // Disable auto-suggest/autocomplete in this editor
    await vscode.workspace.getConfiguration("editor", this.doc.uri).update("quickSuggestions", false);
    await vscode.workspace.getConfiguration("editor", this.doc.uri).update("suggestOnTriggerCharacters", false);
    await vscode.workspace.getConfiguration("editor", this.doc.uri).update("acceptSuggestionOnEnter", "off");
    await vscode.workspace.getConfiguration("editor", this.doc.uri).update("wordBasedSuggestions", "off");
    await vscode.workspace.getConfiguration("editor", this.doc.uri).update("parameterHints.enabled", false);

    this.currentLineIndex = 0;
    this.startTime = null;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.active = true;

    this.showHint();
    this.updateStatusBar();
    this.statusBar.show();

    // Listen for text changes
    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
      if (this.active && e.document === this.doc) {
        this.onTextChange(e);
      }
    });

    this.disposables.push(changeListener);
  }

  private onTextChange(e: vscode.TextDocumentChangeEvent): void {
    if (!this.active || !this.editor || !this.doc || this.processing) {
      return;
    }

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const currentTarget = this.lines[this.currentLineIndex]!;
    const lastLine = this.doc.lineCount - 1;
    const currentDocLine = this.doc.lineAt(lastLine);
    const typed = currentDocLine.text;

    // Check if user pressed Enter
    for (const change of e.contentChanges) {
      if (change.text.includes("\n") || change.text.includes("\r")) {
        this.handleEnter(typed.trimEnd());
        return;
      }
    }

    // Update decorations for current line
    this.updateLineDecorations(typed, currentTarget, lastLine);
    this.updateStatusBar();
  }

  private async handleEnter(typed: string): Promise<void> {
    if (!this.editor || !this.doc) {
      return;
    }

    this.processing = true;

    const target = this.lines[this.currentLineIndex]!;

    // Count keystrokes for this line
    for (let i = 0; i < Math.max(typed.length, target.length); i++) {
      this.totalKeystrokes++;
      if (i < typed.length && i < target.length && typed[i] === target[i]) {
        this.correctKeystrokes++;
      }
    }

    // Replace last line(s) with the correct target (remove extra newlines from Enter)
    const lastLine = this.doc.lineCount - 1;
    const replaceFrom = lastLine > 0 && this.doc.lineAt(lastLine).text.length === 0
      ? lastLine - 1
      : lastLine;
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      replaceFrom, 0,
      lastLine, this.doc.lineAt(lastLine).text.length
    );
    edit.replace(this.doc.uri, fullRange, target);
    await vscode.workspace.applyEdit(edit);

    this.currentLineIndex++;

    if (this.currentLineIndex >= this.lines.length) {
      this.processing = false;
      this.finish();
    } else {
      await this.showHintAsync();
      this.updateStatusBar();
      this.processing = false;
    }
  }

  private showHint(): void {
    this.showHintAsync();
  }

  private async showHintAsync(): Promise<void> {
    if (!this.editor || !this.doc || this.currentLineIndex >= this.lines.length) {
      return;
    }

    const target = this.lines[this.currentLineIndex]!;

    // Insert a new line at the bottom for typing
    const lastLine = this.doc.lineCount - 1;
    if (this.currentLineIndex > 0) {
      const edit = new vscode.WorkspaceEdit();
      const endPos = this.doc.lineAt(lastLine).range.end;
      edit.insert(this.doc.uri, endPos, "\n");
      await vscode.workspace.applyEdit(edit);
    }

    if (!this.editor || !this.doc) {
      return;
    }

    const newLastLine = this.doc.lineCount - 1;

    this.editor.setDecorations(this.decorationHint, [
      {
        range: new vscode.Range(newLastLine, 0, newLastLine, 0),
        renderOptions: {
          after: {
            contentText: target,
            color: "#555555",
            fontStyle: "italic",
          },
        },
      },
    ]);

    const pos = new vscode.Position(newLastLine, 0);
    this.editor.selection = new vscode.Selection(pos, pos);
    this.editor.revealRange(new vscode.Range(pos, pos));
  }

  private updateLineDecorations(typed: string, target: string, line: number): void {
    if (!this.editor) {
      return;
    }

    const correctRanges: vscode.Range[] = [];
    const errorRanges: vscode.Range[] = [];

    for (let i = 0; i < typed.length; i++) {
      const range = new vscode.Range(line, i, line, i + 1);
      if (i < target.length && typed[i] === target[i]) {
        correctRanges.push(range);
      } else {
        errorRanges.push(range);
      }
    }

    this.editor.setDecorations(this.decorationCorrect, correctRanges);
    this.editor.setDecorations(this.decorationError, errorRanges);

    // Update hint to show remaining
    if (typed.length < target.length) {
      this.editor.setDecorations(this.decorationHint, [
        {
          range: new vscode.Range(line, typed.length, line, typed.length),
          renderOptions: {
            after: {
              contentText: target.slice(typed.length),
              color: "#555555",
              fontStyle: "italic",
            },
          },
        },
      ]);
    } else {
      this.editor.setDecorations(this.decorationHint, []);
    }
  }

  private updateStatusBar(): void {
    const progress = `${this.currentLineIndex}/${this.lines.length}`;
    const wpm = this.computeWpm();
    const acc = this.computeAccuracy();
    this.statusBar.text = `$(keyboard) Code Practice: Line ${progress} | WPM: ${wpm} | Acc: ${acc}`;
  }

  private computeWpm(): string {
    if (!this.startTime) {
      return "--";
    }
    const minutes = (Date.now() - this.startTime) / 60_000;
    if (minutes <= 0) {
      return "0";
    }
    return String(Math.round((this.correctKeystrokes / 5) / minutes));
  }

  private computeAccuracy(): string {
    if (this.totalKeystrokes === 0) {
      return "--%";
    }
    return `${Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)}%`;
  }

  private finish(): void {
    this.active = false;
    const wpm = this.computeWpm();
    const acc = this.computeAccuracy();

    this.statusBar.text = `$(check) Code Practice Done! WPM: ${wpm} | Acc: ${acc}`;

    vscode.window.showInformationMessage(
      `Type Practice 完成！WPM: ${wpm}，準確率: ${acc}，共 ${this.lines.length} 行`
    );

    this.dispose();
  }

  dispose(): void {
    this.active = false;
    this.decorationCorrect.dispose();
    this.decorationError.dispose();
    this.decorationHint.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
    // Keep statusBar visible for result; it auto-hides on next session
  }

  private async pickRandomFile(rootPath: string): Promise<string | null> {
    const files = await this.collectFiles(rootPath, 3);
    if (files.length === 0) {
      return null;
    }
    return files[Math.floor(Math.random() * files.length)]!;
  }

  private async collectFiles(dir: string, maxDepth: number): Promise<string[]> {
    if (maxDepth <= 0) {
      return [];
    }
    const results: string[] = [];
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "out" || entry.name === "dist" || entry.name === "__pycache__") {
          continue;
        }
        const sub = await this.collectFiles(fullPath, maxDepth - 1);
        results.push(...sub);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CODE_EXTENSIONS.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const map: Record<string, string> = {
      ".ts": "typescript", ".tsx": "typescriptreact",
      ".js": "javascript", ".jsx": "javascriptreact",
      ".py": "python", ".java": "java", ".c": "c", ".cpp": "cpp",
      ".cs": "csharp", ".go": "go", ".rs": "rust", ".rb": "ruby",
      ".php": "php", ".swift": "swift", ".kt": "kotlin",
      ".html": "html", ".css": "css", ".scss": "scss",
      ".json": "json", ".yaml": "yaml", ".yml": "yaml",
      ".sh": "shellscript", ".vue": "vue", ".svelte": "svelte",
    };
    return map[ext] ?? "plaintext";
  }
}
