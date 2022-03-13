import { getInstance, deleteInstance, clearDebugContainer } from '@/src/index';
import { Debug } from '@/src/debug';

afterEach(() => {
  clearDebugContainer();
});

test('should all debug instances can be cleared from the container', () => {
  expect(getInstance('a')).toBeUndefined();
  expect(getInstance('b')).toBeUndefined();
  expect(getInstance('c')).toBeUndefined();

  const a = new Debug('a');
  const b = new Debug('b');
  const c = new Debug('c');

  expect(getInstance('a')).toBe(a);
  expect(getInstance('b')).toBe(b);
  expect(getInstance('c')).toBe(c);

  expect([...clearDebugContainer()]).toHaveLength(3);

  expect(getInstance('a')).toBeUndefined();
  expect(getInstance('b')).toBeUndefined();
  expect(getInstance('c')).toBeUndefined();
});

test('should debug instance can be added and retreived from the container', () => {
  const id = '__test__';
  expect(getInstance(id)).toBeUndefined();

  const d = new Debug(id);

  expect(getInstance(id)).toBe(d);
});

test('should multiple debug instances can be retreived from the container', () => {
  const idFirst = '__test__';
  const idSecond = '__testb__';
  expect(getInstance(idFirst)).toBeUndefined();
  expect(getInstance(idSecond)).toBeUndefined();

  const dFirst = new Debug(idFirst);
  const dSecond = new Debug(idSecond);

  expect(getInstance(idFirst)).toBe(dFirst);
  expect(getInstance(idSecond)).toBe(dSecond);
});

test('should debug instance can be deleted from the container', () => {
  const id = '__test__';
  const d = new Debug(id);
  expect(d).toBeDefined();
  expect(getInstance(id)).toBeDefined();
  expect(deleteInstance(id)).toBe(true);
  expect(getInstance(id)).toBeUndefined();
});
