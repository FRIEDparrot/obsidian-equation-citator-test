export class Notice {
  constructor(msg: string) {
    // Use debug instead of log; only used for debugging in tests
    console.debug("Obsidian.Notice", msg);
  }
}

export type EditorPosition = {
  line: number;
  ch: number;
};