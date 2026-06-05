import type { IPlatformAdapter, PlatformMeta } from '../base.adapter.js';

export class KuwoAdapter implements IPlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'kuwo',
    name: 'KuWo Music',
    nameZh: '酷我音乐',
    icon: 'kuwo',
    loginType: 'qrcode',
  };

  // TODO: Implement KuWo adapter
  async generateQRKey(): Promise<string> {
    throw new Error('KuWo adapter not yet implemented');
  }
  async createQRCode(_key: string): Promise<{ key: string; qrImage: string }> {
    throw new Error('KuWo adapter not yet implemented');
  }
  async checkQRStatus(_key: string) {
    throw new Error('KuWo adapter not yet implemented');
  }
  async searchSongs() { return []; }
  async getUserFavorites() { return []; }
  async createPlaylist() { return ''; }
  async addSongsToPlaylist() { return 0; }
}
