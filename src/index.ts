import { Console } from 'console';
import * as util from 'util';
import { nop } from '@pipeletteio/nop';
import { TimeMeter } from '@pipeletteio/time-meter';

export class Debug extends Console {
  /** A global meter that be use as default meter on Debug instance. */
  static GLOBAL_METER: TimeMeter = new TimeMeter();

  /** The debug instance name. */
  readonly name: string | null;

  /** The debug pattern instance. */
  protected _pattern: string;

  /** The debug meter instance. */
  protected _meter: TimeMeter;

  /** Write a formatted message to stderr. */
  fail: (arg: string) => void;

  /** Write a formatted message to stdout. */
  done: (arg: string) => void;

  /** Write a formatted message prefixed with an invalid check symbol to stderr. */
  invalid: (arg: string) => void;

  /** Write a formatted message prefixed with a valid check symbol to stdout. */
  valid: (arg: string) => void;

  /** Write a formatted message prefixed with an interogation symbol to stdout. */
  question: (arg: string) => void;

  /** Write a formatted message prefixed with a chevron symbol to stdout. */
  title: (arg: string) => void;

  /**
   * @param name - The debug instance name.
   * @param options - The debug instance options object.
   * @param options.useNewMeter - Set to true if the debug instance must use an independent time meter.
   */
  constructor (name?: string | null, options: { useNewMeter?: boolean | null } = {}) {
    super({ stderr: process.stderr, stdout: process.stdout });

    this.name = name || null;

    this._pattern = name ? `[${name}] ` : '';
    this._pattern += '%s \u001b[1m\u001b[90m%s\u001b[0m\u001b[0m';
    this._meter = options.useNewMeter ? new TimeMeter() : Debug.GLOBAL_METER;

    this._registerLogMethod('fail', this.error);
    this._registerLogMethod('done', this.log);
    this._registerLogMethod('invalid', this.error, '\u001b[31m✗\u001b[0m');
    this._registerLogMethod('valid', this.log, '\u001b[32m✔\u001b[0m');
    this._registerLogMethod('question', this.log, '\u001b[33m❓\u001b[0m');
    this._registerLogMethod('title', this.log, '\u001b[36m❱\u001b[0m');

    if (!this._isDebugNeeded()) this._disableLogMethods();
  }

  /**
   * Register a new debugging method.
   * @param name - The method name.
   * @param output - The console method that be used.
   * @param symbol - Any symbol to prevent the message.
   */
  protected _registerLogMethod (name: string, output: (msg: string, ...args: any[]) => void, symbol?: string): void {
    let pattern = this._pattern;

    // Supply symbol if defined.
    if (typeof symbol === 'string')
      pattern = `${symbol} ${pattern}`;

    Object.defineProperty(this, name, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (arg: string): void => {
        return output(pattern, arg, this._getNextReadableTime());
      }
    });
  }

  /** Replace methods by nop function. (nop function is a function that do nothing.) */
  protected _disableLogMethods (): void {
    const debugDescriptors = Object.entries(Object.getOwnPropertyDescriptors(this));
    return Object.defineProperties(this,
      Object.fromEntries(
        debugDescriptors.map(([name, descriptor]: [string, any]) => {
          return typeof descriptor.value !== 'function'
            ? [name, descriptor]
            : [name, { ...descriptor, value: nop }];
        })
      )
    );
  }

  /** Get the "MUST DEBUG" state. */
  protected _isDebugNeeded (): boolean {
    const env = process.env;
    const envDebug = env.DEBUG || env.NDEBUG || env.NODE_DEBUG || undefined;

    if (env.PIPELETTEIO_DEBUG)
      return env.PIPELETTEIO_DEBUG === 'true';

    if (envDebug)
      return envDebug === 'true';

    if (env.CI || env.CONTINUOUS_INTEGRATION)
      return false;

    if (env.NODE_ENV === 'production' || env.NODE_ENV === 'test')
      return false;

    return true;
  }

  /** Get the time spent since the last use of an added method. */
  protected _getNextReadableTime (): string {
    const time = this._meter.next();
    const ms = Math.ceil(time[0] * 1e3 + time[1] / 1e6);
    return ms >= 1e3
      ? util.format('+%ss', Math.round(ms / 1e3 * 1e2) / 1e2)
      : util.format('+%sms', ms);
  }
}

/**
 * The debug const is the default debug entity.
 */
export const debug = new Debug();
