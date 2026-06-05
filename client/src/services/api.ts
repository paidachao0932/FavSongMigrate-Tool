import type { PlatformMeta } from '../types/platform';
import type { MatchResult, MigrateResult } from '../types/song';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `请求失败: ${res.status}`);
  }
  return res.json();
}

export async function fetchPlatforms(): Promise<PlatformMeta[]> {
  const data = await request<{ platforms: PlatformMeta[] }>('/platforms');
  return data.platforms;
}

export async function getQRKey(platform: string): Promise<string> {
  const data = await request<{ key: string }>(`/auth/${platform}/qr-key`, { method: 'POST' });
  return data.key;
}

export async function getQRCode(platform: string, key: string): Promise<{ key: string; qrImage: string }> {
  return request(`/auth/${platform}/qr-create`, {
    method: 'POST',
    body: JSON.stringify({ key }),
  });
}

export async function checkQR(platform: string, key: string): Promise<{
  code: number;
  message: string;
  cookie?: string;
}> {
  return request(`/auth/${platform}/qr-check`, {
    method: 'POST',
    body: JSON.stringify({ key }),
  });
}

export async function batchSearch(
  platform: string,
  songs: { title: string; artist: string }[],
  cookie: string
): Promise<{ results: MatchResult[] }> {
  return request(`/search/${platform}/batch`, {
    method: 'POST',
    body: JSON.stringify({ songs, cookie }),
  });
}

export async function migrate(
  platform: string,
  songs: { title: string; artist: string }[],
  playlistName: string,
  cookie: string,
  skipDuplicates: boolean
): Promise<MigrateResult> {
  return request(`/playlist/${platform}/migrate`, {
    method: 'POST',
    body: JSON.stringify({ songs, playlistName, cookie, skipDuplicates }),
  });
}

export async function getFavorites(
  platform: string,
  cookie: string
): Promise<{ favorites: { platformId: string; title: string; artist: string }[] }> {
  return request(`/playlist/${platform}/favorites?cookie=${encodeURIComponent(cookie)}`);
}
