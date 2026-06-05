import type { IPlatformAdapter, PlatformMeta } from '../base.adapter.js';

export class QQMusicAdapter implements IPlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'qqmusic',
    name: 'QQ Music',
    nameZh: 'QQ音乐',
    icon: 'qqmusic',
    loginType: 'qrcode',
  };

  // TODO: Implement QQ Music adapter
  async generateQRKey(): Promise<string> {
    throw new Error('QQ Music adapter not yet implemented');
  }
  async createQRCode(_key: string): Promise<{ key: string; qrImage: string }> {
    throw new Error('QQ Music adapter not yet implemented');
  }
  async checkQRStatus(_key: string) {
    throw new Error('QQ Music adapter not yet implemented');
  }
  async searchSongs() { return []; }
  async getUserFavorites() { return []; }
  async createPlaylist() { return ''; }
  async addSongsToPlaylist() { return 0; }
}
