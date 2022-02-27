const stripAnsi = require('strip-ansi');

import { debug, Debug } from '@/src/index';

const env = process.env;

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

function getOutput (type: string) {
  const response: string[] = [];

  (<any>process)[type].write = (chunk: Buffer) => {
    response.push(stripAnsi(chunk.toString()));
  };

  return response;
}

test('should standard stderr work fine', () => {
  const stderr = getOutput('stderr');
  debug.error('error');
  debug.warn('warn');
  expect(stderr).toEqual(['error\n', 'warn\n']);
});

test('should standard stdout work fine', () => {
  const stdout = getOutput('stdout');
  debug.log('log');
  debug.info('info');
  expect(stdout).toEqual(['log\n', 'info\n']);
});

test('should fail work fine', () => {
  const stderr = getOutput('stderr');
  debug.fail('fail');
  expect(stripAnsi(stderr.shift())).toMatch(/^fail \+\d{1,3}ms\n/);
});

test('should done work fine', () => {
  const stdout = getOutput('stdout');
  debug.done('done');
  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);
});

test('should invalid work fine', () => {
  const stderr = getOutput('stderr');
  debug.invalid('invalid');
  expect(stderr.shift()).toMatch(/^✗ invalid \+\d{1,3}ms\n/);
});

test('should valid work fine', () => {
  const stdout = getOutput('stdout');
  debug.valid('valid');
  expect(stdout.shift()).toMatch(/^✔ valid \+\d{1,3}ms\n/);
});

test('should question work fine', () => {
  const stdout = getOutput('stdout');
  debug.question('question');
  expect(stdout.shift()).toMatch(/^❓ question \+\d{1,3}ms\n/);
});

test('should title work fine', () => {
  const stdout = getOutput('stdout');
  debug.title('title');
  expect(stdout.shift()).toMatch(/^❱ title \+\d{1,3}ms\n/);
});

test('should name parameter work fine and print on logs', () => {
  const localDebug = new Debug('test_debug');
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout.shift()).toMatch(/^\[test_debug\] done \+\d{1,3}ms\n/);
});

test('should use new meter work fine', () => {
  // Ensure default use the global meter.
  expect((<any>debug)._meter).toBe(Debug.GLOBAL_METER);

  const localDebug = new Debug(null, { useNewMeter: true });
  expect((<any>localDebug)._meter).not.toBe(Debug.GLOBAL_METER);
});

test('should report time fine', (done) => {
  const localDebug = new Debug();
  const stdout = getOutput('stdout');

  setTimeout(() => {
    localDebug.done('ok');
    expect(stdout.shift()).toMatch(/^ok \+1.\d{0,2}s\n/);
    done();
  }, 1050);
});

test('should PIPELETTEIO_DEBUG="false" env do nothing', () => {
  env.PIPELETTEIO_DEBUG = 'false';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout).toHaveLength(0);

  delete env.PIPELETTEIO_DEBUG;
});

test('should DEBUG="true" env log fine', () => {
  env.DEBUG = 'true';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);

  delete env.DEBUG;
});

test('should NDEBUG="true" env log fine', () => {
  env.NDEBUG = 'true';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);

  delete env.NDEBUG;
});

test('should NODE_DEBUG="true" env log fine', () => {
  env.NODE_DEBUG = 'true';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);

  delete env.NODE_DEBUG;
});

test('should CI="..." env do nothing', () => {
  env.CI = 'anything';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout).toHaveLength(0);

  delete env.CI;
});

test('should CONTINUOUS_INTEGRATION="..." env do nothing', () => {
  env.CONTINUOUS_INTEGRATION = 'anything';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout).toHaveLength(0);

  delete env.CONTINUOUS_INTEGRATION;
});

test('should NODE_ENV="production" env do nothing', () => {
  env.NODE_ENV = 'production';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout).toHaveLength(0);

  delete env.NODE_ENV;
});

test('should NODE_ENV="test" env do nothing', () => {
  env.NODE_ENV = 'test';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout).toHaveLength(0);

  delete env.NODE_ENV;
});

test('should NODE_ENV="..." env log fine', () => {
  env.NODE_ENV = 'anything';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');
  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);

  delete env.NODE_ENV;
});

test('should forced debug mode work fine', () => {
  env.PIPELETTEIO_DEBUG = 'true';
  env.CI = 'anything';
  env.CONTINUOUS_INTEGRATION = 'anything';
  env.NODE_ENV = 'production';
  env.DEBUG = 'false';
  env.NDEBUG = 'false';
  env.NODE_DEBUG = 'false';

  const localDebug = new Debug();
  const stdout = getOutput('stdout');
  localDebug.done('done');

  expect(stdout.shift()).toMatch(/^done \+\d{1,3}ms\n/);
});
