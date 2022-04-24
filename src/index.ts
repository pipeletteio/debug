export { DebugInterface, DebugOptions } from './types';

import { Debug } from './debug';
export { debug, Debug } from './debug';

const store = {
  map: new Map<string, Debug>()
};

export function storeInstance (instance: Debug): boolean {
  if (instance.identifier === null) {
    return false;
  } else {
    store.map.set(instance.identifier, instance);
    return true;
  }
}

export function getInstance (name: string): Debug | undefined {
  return store.map.get(name);
}

export function deleteInstance (name: string): boolean {
  return store.map.delete(name);
}

export function clearDebugContainer (): Map<string, Debug> {
  const map = store.map;
  store.map = new Map();
  return map;
}
