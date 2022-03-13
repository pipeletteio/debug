export interface DebugInterface {
  fail: (...args: any[]) => void;
  done: (...args: any[]) => void;
  note: (...args: any[]) => void;
  invalid: (...args: any[]) => void;
  valid: (...args: any[]) => void;
  question: (...args: any[]) => void;
  title: (...args: any[]) => void;
}

export interface DebugOptions {
  /**
   * Use the default shared meter if false or undefined or use a new instance if true.
   */
  useNewMeter?: boolean;

  /**
   * Must log using ANSI styles?
   */
  useStyle?: boolean;

  /**
   * Console stderr.
   * See: https://nodejs.org/api/console.html#console
   */
  stderr?: NodeJS.WritableStream;

  /**
   * Console stdout.
   * See: https://nodejs.org/api/console.html#console
   */
  stdout?: NodeJS.WritableStream;
}
