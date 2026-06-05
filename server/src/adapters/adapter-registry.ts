import type { IPlatformAdapter, PlatformMeta } from './base.adapter.js';

const registry = new Map<string, IPlatformAdapter>();

export function registerAdapter(adapter: IPlatformAdapter): void {
  if (registry.has(adapter.meta.id)) {
    console.warn(`Adapter "${adapter.meta.id}" is already registered, overwriting.`);
  }
  registry.set(adapter.meta.id, adapter);
  console.log(`[Adapter] Registered: ${adapter.meta.nameZh} (${adapter.meta.id})`);
}

export function getAdapter(id: string): IPlatformAdapter | undefined {
  return registry.get(id);
}

export function listAdapters(): PlatformMeta[] {
  return Array.from(registry.values()).map((a) => ({ ...a.meta }));
}
