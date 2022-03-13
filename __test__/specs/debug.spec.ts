import stripAnsi from 'strip-ansi';
import { nop } from '@pipeletteio/nop';
import { debug, Debug } from '@/src/debug';

let initialStderrWrite: (chunk: Buffer, encoding?: any, next?: (err?: Error) => void) => boolean;
let initialStdoutWrite: (chunk: Buffer, encoding?: any, next?: (err?: Error) => void) => boolean;

beforeAll(() => {
  initialStderrWrite = process.stderr.write;
  initialStdoutWrite = process.stdout.write;
});

afterEach(() => {
  process.stderr.write = initialStderrWrite;
  process.stdout.write = initialStdoutWrite;
});

function getOutput (type: 'stderr' | 'stdout'): string[] {
  const response: string[] = [];

  (<any>process)[type].write = (chunk: Buffer) => {
    response.push(stripAnsi(chunk.toString()));
  };

  return response;
}

describe('checking console streams', () => {
  test('should stderr works fine', () => {
    const stderr = getOutput('stderr');
    debug.error('error');
    debug.warn('warn');
    expect(stderr).toEqual(['error\n', 'warn\n']);
  });

  test('should stdout works fine', () => {
    const stdout = getOutput('stdout');
    debug.log('log');
    debug.info('info');
    expect(stdout).toEqual(['log\n', 'info\n']);
  });
});

describe('checking debug methods', () => {
  test('should fail works', () => {
    const stderr = getOutput('stderr');
    debug.fail('fail');
    expect(stderr.shift()).toMatch(/^fail \+\d{1,3}ms\n/);
  });

  test('should done works', () => {
    const stdout = getOutput('stdout');
    debug.done('done');
    expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);
  });

  test('should note works', () => {
    const stdout = getOutput('stdout');
    debug.note('note');
    expect(stdout.shift()).toMatch(/^note \+\d{1,3}ms\n/);
  });

  test('should invalid works', () => {
    const stderr = getOutput('stderr');
    debug.invalid('invalid');
    expect(stderr.shift()).toMatch(/^✗ invalid \+\d{1,3}ms\n/);
  });

  test('should valid works', () => {
    const stdout = getOutput('stdout');
    debug.valid('valid');
    expect(stdout.shift()).toMatch(/^✔ valid \+\d{1,3}ms\n/);
  });

  test('should question works', () => {
    const stdout = getOutput('stdout');
    debug.question('question');
    expect(stdout.shift()).toMatch(/^\? question \+\d{1,3}ms\n/);
  });

  test('should title works', () => {
    const stdout = getOutput('stdout');
    debug.title('title');
    expect(stdout.shift()).toMatch(/^❱ title \+\d{1,3}ms\n/);
  });
});

describe('checking common methods', () => {
  test('getMeter must return a valid shared TimeMeter', () => {
    const d = new Debug();
    expect(d.getMeter()).toBe(Debug.GLOBAL_METER);
  });

  test('getMeter must return a valid independent TimeMeter', () => {
    const d = new Debug(null, { useNewMeter: true });
    expect(d.getMeter()).not.toBe(Debug.GLOBAL_METER);
  });
});

describe('Debug', () => {
  test('should new instance can be built with default args', () => {
    const d = new Debug();
    expect(d).toBeInstanceOf(Debug);
    expect(d).toHaveProperty('identifier', null);
    expect(d).toHaveProperty('useNewMeter', false);
    expect(d).toHaveProperty('useStyle', true);
    expect(d).toHaveProperty('isDebug', true);
  });

  test('should new instance can be built custom default args', () => {
    const d = new Debug('ident', { useNewMeter: true, useStyle: false });
    expect(d).toBeInstanceOf(Debug);
    expect(d).toHaveProperty('identifier', 'ident');
    expect(d).toHaveProperty('useNewMeter', true);
    expect(d).toHaveProperty('useStyle', false);
    expect(d).toHaveProperty('isDebug', true);
  });
});

describe('debug state checking', () => {
  const { DEBUG, PIPELETTEIO_DEBUG } = process.env;

  beforeEach(() => {
    delete process.env.DEBUG;
    delete process.env.PIPELETTEIO_DEBUG;
  });

  afterAll(() => {
    process.env.DEBUG = DEBUG;
    process.env.PIPELETTEIO_DEBUG = PIPELETTEIO_DEBUG;
  });

  test('should debug mode is disabled by default', () => {
    const d = new Debug();
    expect(d.isDebug).toBe(false);
    expect(d.fail).toBe(nop);
  });

  test('should debug mode is enabled when env PIPELETTEIO_DEBUG = "true"', () => {
    process.env.PIPELETTEIO_DEBUG = 'true';
    const d = new Debug();
    expect(d.isDebug).toBe(true);
    expect(d.valid).not.toBe(nop);
  });

  test('should debug mode is enabled when env PIPELETTEIO_DEBUG = "1"', () => {
    process.env.PIPELETTEIO_DEBUG = '1';
    const d = new Debug();
    expect(d.isDebug).toBe(true);
    expect(d.done).not.toBe(nop);
  });

  test('should debug mode is enabled when env DEBUG = "*"', () => {
    process.env.DEBUG = '*';
    const d = new Debug();
    expect(d.isDebug).toBe(true);
    expect(d.done).not.toBe(nop);
  });

  test('should debug mode is enabled when env DEBUG = "__test__/*"', () => {
    process.env.DEBUG = '__test__/*';
    const d = new Debug('__test__/scope');
    expect(d.isDebug).toBe(true);
    expect(d.done).not.toBe(nop);
  });
});
