import { buildPrompt } from "../data/words";

export type SessionPhase = "typing" | "finished";

export interface SessionSnapshot {
  phase: SessionPhase;
  target: string;
  typed: string;
  wordCount: number;
  wordsCompleted: number;
  correctKeystrokes: number;
  totalKeystrokes: number;
  /** Per-index: true = correct, false = incorrect, undefined = not typed yet */
  correctness: ReadonlyArray<boolean | undefined>;
  startedAt: number | null;
  finishedAt: number | null;
  wpm: number | null;
  accuracy: number | null;
}

export class TypingSession {
  readonly wordCount: number;
  private target: string;
  private typed = "";
  private correctKeystrokes = 0;
  private totalKeystrokes = 0;
  private startedAt: number | null = null;
  private finishedAt: number | null = null;
  private phase: SessionPhase = "typing";

  constructor(wordCount = 25, target?: string) {
    this.wordCount = wordCount;
    this.target = target ?? buildPrompt(wordCount);
  }

  getSnapshot(now = Date.now()): SessionSnapshot {
    const correctness = Array.from({ length: this.target.length }, (_, i) => {
      if (i >= this.typed.length) {
        return undefined;
      }
      return this.typed[i] === this.target[i];
    });

    return {
      phase: this.phase,
      target: this.target,
      typed: this.typed,
      wordCount: this.wordCount,
      wordsCompleted: this.countWordsCompleted(),
      correctKeystrokes: this.correctKeystrokes,
      totalKeystrokes: this.totalKeystrokes,
      correctness,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      wpm: this.computeWpm(now),
      accuracy: this.computeAccuracy(),
    };
  }

  handleChar(ch: string, now = Date.now()): SessionSnapshot {
    if (this.phase !== "typing" || ch.length !== 1) {
      return this.getSnapshot(now);
    }

    this.ensureStarted(now);
    this.totalKeystrokes += 1;

    const index = this.typed.length;
    if (index >= this.target.length) {
      return this.getSnapshot(now);
    }

    if (ch === this.target[index]) {
      this.correctKeystrokes += 1;
    }

    this.typed += ch;

    if (this.typed.length >= this.target.length) {
      this.phase = "finished";
      this.finishedAt = now;
    }

    return this.getSnapshot(now);
  }

  handleBackspace(now = Date.now()): SessionSnapshot {
    if (this.phase !== "typing" || this.typed.length === 0) {
      return this.getSnapshot(now);
    }

    this.ensureStarted(now);
    this.typed = this.typed.slice(0, -1);
    return this.getSnapshot(now);
  }

  restart(now = Date.now()): SessionSnapshot {
    this.target = buildPrompt(this.wordCount);
    this.typed = "";
    this.correctKeystrokes = 0;
    this.totalKeystrokes = 0;
    this.startedAt = null;
    this.finishedAt = null;
    this.phase = "typing";
    return this.getSnapshot(now);
  }

  private ensureStarted(now: number): void {
    if (this.startedAt === null) {
      this.startedAt = now;
    }
  }

  private countWordsCompleted(): number {
    if (this.typed.length === 0) {
      return 0;
    }
    // Count fully finished words via spaces typed; last token may be incomplete.
    const spaces = (this.typed.match(/ /g) ?? []).length;
    if (this.phase === "finished") {
      return this.wordCount;
    }
    return Math.min(spaces, this.wordCount);
  }

  private computeWpm(now: number): number | null {
    if (this.startedAt === null) {
      return null;
    }
    const end = this.finishedAt ?? now;
    const minutes = (end - this.startedAt) / 60_000;
    if (minutes <= 0) {
      return 0;
    }
    // Standard: (correct characters / 5) / minutes
    return Math.round((this.correctKeystrokes / 5) / minutes);
  }

  private computeAccuracy(): number | null {
    if (this.totalKeystrokes === 0) {
      return null;
    }
    return Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100);
  }
}
