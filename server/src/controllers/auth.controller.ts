import { Request, Response } from 'express';
import { getAdapter } from '../adapters/adapter-registry.js';

export async function generateQRKey(req: Request, res: Response) {
  const { platform } = req.params;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const key = await adapter.generateQRKey();
  res.json({ key });
}

export async function createQRCode(req: Request, res: Response) {
  const { platform } = req.params;
  const { key } = req.body;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const result = await adapter.createQRCode(key);
  res.json(result);
}

export async function checkQRStatus(req: Request, res: Response) {
  const { platform } = req.params;
  const { key } = req.body;
  const adapter = getAdapter(platform);
  if (!adapter) return res.status(404).json({ error: '平台不存在' });

  const result = await adapter.checkQRStatus(key);
  res.json(result);
}
