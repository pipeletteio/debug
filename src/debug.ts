import { Console } from 'console';
import { TimeMeter } from '@pipeletteio/time-meter';
import { nop } from '@pipeletteio/nop';
import { storeInstance } from '@/src/index';

import type { DebugInterface, DebugOptions } from './types';

type DebugMethodDefs = {
  [Prop in keyof DebugInterface]: {
    parent: 'error' | 'log';
    mark?: string;
    styles?: number[];
  };
};

type DebugMethods = {
  [Prop in keyof DebugInterface]: (...args: any[]) => void;
};

const methodDefs: DebugMethodDefs = {
  fail: { parent: 'error' },
  done: { parent: 'log' },
  note: { parent: 'log' },
  invalid: { parent: 'error', mark: '✗', styles: [31] },
  valid: { parent: 'log', mark: '✔', styles: [32] },
  question: { parent: 'log', mark: '?', styles: [33] },
  title: { parent: 'log', mark: '❱', styles: [36] }
};

export class Debug extends Console implements DebugInterface {
  public static readonly GLOBAL_METER: TimeMeter = new TimeMeter();

  public readonly identifier: string | null;

  public readonly useNewMeter: boolean;

  public readonly useStyle: boolean;

  public readonly isDebug: boolean;

  protected readonly _meter: TimeMeter;

  public readonly fail: (...args: any[]) => void = nop;
  public readonly done: (...args: any[]) => void = nop;
  public readonly note: (...args: any[]) => void = nop;
  public readonly invalid: (...args: any[]) => void = nop;
  public readonly valid: (...args: any[]) => void = nop;
  public readonly question: (...args: any[]) => void = nop;
  public readonly title: (...args: any[]) => void = nop;

  /**
   * @param identifier - The identifier.
   * @param options - The debug options.
   */
  constructor (identifier: string | null = null, {
    useNewMeter = false,
    useStyle = true,
    stderr = process.stderr,
    stdout = process.stdout
  }: DebugOptions = {}) {
    super({ stderr, stdout });

    this.identifier = identifier;
    this.useNewMeter = useNewMeter;
    this.useStyle = useStyle;
    this.isDebug = this._computeDebugState();

    this._meter = useNewMeter ? new TimeMeter() : Debug.GLOBAL_METER;

    if (this.isDebug) {
      this._mountDebugMethods(methodDefs);
    }

    storeInstance(this);
  }

  public getMeter (): TimeMeter {
    return this._meter;
  }

  protected _mountDebugMethods (defs: DebugMethodDefs): void {
    Object.assign(this, this._buildDebugMethods(defs));
  }

  protected _buildDebugMethods (defs: DebugMethodDefs): DebugMethods {
    const entries = Object.entries(defs).map(([key, { parent, mark, styles }]) => {
      const debugFn = this[parent].bind(this);
      const pattern = this._buildPattern({ mark, styles });
      return [
        key,
        (...args: any[]): void => {
          for (let i = 0; i < args.length; ++i) {
            debugFn(pattern, args[0], this._getNextReadableTime());
          }
        }
      ];
    });

    return Object.fromEntries(entries);
  }

  protected _buildPattern ({ mark, styles = [] }: { mark?: string, styles?: number[] }): string {
    let pattern = '';

    const boldStyles = Array.from(new Set([1, ...styles]));
    const patternize = (arg: string, inStyles = boldStyles): void => {
      pattern += this.useStyle ? this._stylize(inStyles, arg) : arg;
      pattern += ' ';
    };

    if (this.identifier) {
      patternize(this.identifier);
    }

    if (mark) {
      patternize(mark);
    }

    // Represent the msg.
    patternize(`%s`, styles);
    // Represent the time.
    patternize('%s');

    return pattern.trim();
  }

  protected _stylize (styles: number[], arg: string): string {
    return `\u001b[${styles.join(';')}m${arg}\u001b[0m`;
  }

  protected _getNextReadableTime (): string {
    return `+${this._meter.next()}ms`;
  }

  protected _computeDebugState (): boolean {
    if (this._checkForDebug(process.env.PIPELETTEIO_DEBUG)) {
      return true;
    }

    if (this._checkForDebug(process.env.DEBUG)) {
      return true;
    }

    return false;
  }

  protected _checkForDebug (arg?: string): boolean {
    if (typeof arg === 'string') {
      if (arg === 'true' || arg === '1' || arg === '*') {
        return true;
      }

      if (this.identifier?.length) {
        const regexp = new RegExp(`^${arg.replace('*', '.*')}$`);
        const match = this.identifier.match(regexp);
        if (match !== null && match.length > 0) {
          return true;
        }
      }
    }

    return false;
  }
}

/**
 * The debug const is the default debug entity.
 */
export const debug = new Debug();
