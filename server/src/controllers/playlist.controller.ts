import { Request, Response } from 'express';
import { getAdapter } from '../adapters/adapter-registry.js';
import { migrate } from '../services/migration.service.js';
import type { CreatePlaylistRequest, AddSongsRequest, MigrateRequest } from '../types/api.js';

export async function createPlaylist(req: Request, res: Response) {
  const { platform } = req.params;
  const { name, cookie } = req.body as CreatePlaylistRequest;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const playlistId = await adapter.createPlaylist(name, cookie);
  res.json({ playlistId });
}

export async function addSongs(req: Request, res: Response) {
  const { platform } = req.params;
  const { playlistId, songIds, cookie } = req.body as AddSongsRequest;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const count = await adapter.addSongsToPlaylist(playlistId, songIds, cookie);
  res.json({ added: count });
}

export async function migratePlaylist(req: Request, res: Response) {
  const { platform } = req.params;
  const body = req.body as MigrateRequest;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const result = await migrate(adapter, body);
  res.json(result);
}

export async function getFavorites(req: Request, res: Response) {
  const { platform } = req.params;
  const cookie = String(req.query.cookie || '');
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 2000;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const favorites = await adapter.getUserFavorites(cookie, offset, limit);
  res.json({ favorites });
}
