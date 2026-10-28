import * as vscode from "vscode";
import { TypingSession, type SessionSnapshot } from "../core/TypingSession";

const ESC = "\x1b";
const CLEAR = `${ESC}[2J${ESC}[H`;
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const RESET = `${ESC}[0m`;
const DIM = `${ESC}[2m`;
const BOLD = `${ESC}[1m`;
const GREEN = `${ESC}[32m`;
const RED = `${ESC}[31m`;
const RED_BG = `${ESC}[41m`;
const CYAN = `${ESC}[36m`;
const YELLOW = `${ESC}[33m`;

export class TypingPty implements vscode.Pseudoterminal {
  private readonly writeEmitter = new vscode.EventEmitter<string>();
  private readonly closeEmitter = new vscode.EventEmitter<number | void>();
  private session: TypingSession;
  private cols = 80;
  private closed = false;

  readonly onDidWrite = this.writeEmitter.event;
  readonly onDidClose = this.closeEmitter.event;

  constructor(private readonly wordCount = 25) {
    this.session = new TypingSession(wordCount);
  }

  open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
    if (_initialDimensions) {
      this.cols = Math.max(40, _initialDimensions.columns);
    }
    this.render(this.session.getSnapshot());
  }

  close(): void {
    this.closed = true;
    this.writeEmitter.fire(SHOW_CURSOR + RESET);
  }

  setDimensions(dimensions: vscode.TerminalDimensions): void {
    this.cols = Math.max(40, dimensions.columns);
    this.render(this.session.getSnapshot());
  }

  handleInput(data: string): void {
    if (this.closed) {
      return;
    }

    const snap = this.session.getSnapshot();

    // Esc
    if (data === "\x1b") {
      this.writeEmitter.fire(SHOW_CURSOR + RESET + CLEAR);
      this.closeEmitter.fire(0);
      return;
    }

    // Ctrl+R
    if (data === "\x12") {
      this.render(this.session.restart());
      return;
    }

    if (snap.phase === "finished") {
      if (data === "\r" || data === "\n") {
        this.render(this.session.restart());
      }
      return;
    }

    // Backspace (DEL or BS)
    if (data === "\x7f" || data === "\b") {
      this.render(this.session.handleBackspace());
      return;
    }

    // Ignore other control sequences (arrows, etc.)
    if (data.startsWith("\x1b")) {
      return;
    }

    for (const ch of data) {
      if (ch === "\r" || ch === "\n") {
        continue;
      }
      if (ch < " " && ch !== " ") {
        continue;
      }
      this.session.handleChar(ch);
    }
    this.render(this.session.getSnapshot());
  }

  private render(snap: SessionSnapshot): void {
    const lines: string[] = [];
    const bar = "─".repeat(Math.min(this.cols - 2, 48));

    lines.push(`${BOLD}${CYAN}Type Practice${RESET} — ${snap.wordCount} words`);
    lines.push(DIM + bar + RESET);
    lines.push("");
    lines.push(...this.formatTargetLines(snap));
    lines.push("");
    lines.push(DIM + bar + RESET);

    const wpm = snap.wpm === null ? "--" : String(snap.wpm);
    const acc = snap.accuracy === null ? "--%" : `${snap.accuracy}%`;
    lines.push(
      `WPM: ${YELLOW}${wpm}${RESET}  Acc: ${YELLOW}${acc}${RESET}  Progress: ${snap.wordsCompleted}/${snap.wordCount}`
    );

    if (snap.phase === "finished") {
      lines.push("");
      lines.push(
        `${GREEN}${BOLD}Done!${RESET}  Errors: ${this.errorCount(snap)}  |  Enter: again  |  Esc: quit  |  Ctrl+R: restart`
      );
    } else {
      lines.push(`${DIM}Esc: quit  |  Ctrl+R: restart  |  Backspace: correct${RESET}`);
    }

    this.writeEmitter.fire(HIDE_CURSOR + CLEAR + lines.join("\r\n") + "\r\n");
  }

  private formatTargetLines(snap: SessionSnapshot): string[] {
    const maxWidth = Math.max(20, this.cols - 2);
    const lines: string[] = [];
    let current = "";
    let visible = 0;

    for (let i = 0; i < snap.target.length; i++) {
      const ch = snap.target[i]!;
      const display = ch === " " ? "·" : ch;
      const c = snap.correctness[i];
      let styled: string;

      if (c === true) {
        styled = `${GREEN}${display}${RESET}`;
      } else if (c === false) {
        styled = `${RED_BG}${RED}${BOLD}${display === "·" ? " " : display}${RESET}`;
      } else if (i === snap.typed.length) {
        styled = `${BOLD}${CYAN}${display}${RESET}`;
      } else {
        styled = `${DIM}${display}${RESET}`;
      }

      if (visible >= maxWidth) {
        lines.push(current);
        current = "";
        visible = 0;
      }
      current += styled;
      visible += 1;
    }

    if (current.length > 0 || lines.length === 0) {
      lines.push(current);
    }
    return lines;
  }

  private errorCount(snap: SessionSnapshot): number {
    let n = 0;
    for (const c of snap.correctness) {
      if (c === false) {
        n += 1;
      }
    }
    return n;
  }
}
